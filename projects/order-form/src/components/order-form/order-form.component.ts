import { ChangeDetectorRef, Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BindUnsubscribe, IUnsubscribe, NumberHelper } from 'base-components';
import { BaseOrderForm, OcoStep, orderDurations, orderTypes, QuantityInputComponent } from 'base-order-form';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { filterByConnectionAndInstrument, filterPositions, RealPositionsRepository } from 'real-trading';
import { Storage } from 'storage';
import {
  IAccount,
  IInstrument,
  IOrder,
  IQuote,
  Level1DataFeed,
  OrderDuration,
  OrderSide,
  OrdersRepository,
  OrderStatus,
  OrderType,
  PositionsFeed,
  PositionsRepository,
  QuoteSide,
  roundToTickSize,
  UpdateType
} from 'trading';
import { InstrumentFormatter } from 'data-grid';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number/input-number.component';

const orderLastPriceKey = 'orderLastPrice';
const orderLastLimitKey = 'orderLastLimitKey';

interface OrderFormState {
  instrument: IInstrument;
  link: string | number;
  orderLink?: string;
  account?: IAccount;
  amountButtons: any[];
}

export interface OrderFormComponent extends ILayoutNode, IUnsubscribe {
}

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
@UntilDestroy()
@LayoutNode()
@BindUnsubscribe()
export class OrderFormComponent extends BaseOrderForm implements OnInit, OnDestroy, IStateProvider<OrderFormState> {
  isOco = false;
  ocoStep = OcoStep.None;

  firstOcoOrder: IOrder;
  secondOcoOrder: IOrder;

  private _formatter = InstrumentFormatter.forInstrument();

  get isStopLimit() {
    return OrderType.StopLimit === this.formValue.type;
  }

  @ViewChild(QuantityInputComponent) quantityInput: QuantityInputComponent;
  @ViewChild('priceNode') priceNode: NzInputNumberComponent;
  @ViewChild('limitPriceNode') limitPriceNode: NzInputNumberComponent;

  private _instrument: IInstrument;

  get shouldDisablePrice() {
    const limitTypes = [OrderType.Limit, OrderType.StopLimit, OrderType.StopMarket];
    return !limitTypes.includes(this.formValue.type);
  }

  get quantity() {
    return this.formValue.quantity;
  }

  private orderLink: string;

  @Input()
  set instrument(value: IInstrument) {
    if (value?.id === this.instrument?.id)
      return;

    this._instrument = value;
    this._formatter = InstrumentFormatter.forInstrument(value);

    if (this.price != null) {
      this.price = roundToTickSize(this.price, this._instrument.tickSize);
      this.priceNode?.updateDisplayValue(this.price);
    }
    if (this.limitPrice != null) {
      this.limitPrice = roundToTickSize(this.limitPrice, this._instrument.tickSize);
      this.limitPriceNode?.updateDisplayValue(this.limitPrice);
    }


    const { symbol, exchange } = value;
    this.form?.patchValue({ symbol, exchange });

    this.loadData();
  }

  get instrument(): IInstrument {
    return this._instrument;
  }

  get precision(): number {
    return this.instrument?.precision ?? 2;
  }

  account: IAccount;

  get accountId() {
    return this.formValue?.accountId;
  }

  orderDurations = orderDurations;
  orderTypes = orderTypes.map(item => ({ ...item, disabled: false }));
  step = 1;
  OrderSide = OrderSide;
  editIceAmount: boolean;

  bidPrice: string;
  askPrice: string;

  askVolume: number;
  bidVolume: number;

  limitPrice: number;
  price: number;

  amountButtons = [
    { value: 1 }, { value: 2 },
    { value: 10 }, { value: 50 },
    { value: 100 },
  ];

  readonly priceFormatter = (price: number) => this._formatter.format(Number(price));

  constructor(
    protected fb: FormBuilder,
    protected _repository: OrdersRepository,
    protected positionsRepository: PositionsRepository,
    private _levelOneDatafeed: Level1DataFeed,
    private _positionDatafeed: PositionsFeed,
    private _storage: Storage,
    protected _injector: Injector,
    protected _changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
    this.autoLoadData = false;

    this.setTabIcon('icon-widget-create-orders');
    this.setNavbarTitleGetter(this._getNavbarTitle.bind(this));
    this.price = this._storage.getItem(orderLastPriceKey) ?? 1;
    this.limitPrice = this._storage.getItem(orderLastLimitKey) ?? 1;
  }

  ngOnInit() {
    super.ngOnInit();
    this.onTypeUpdated();
    this.onRemove(
      this._levelOneDatafeed.on(filterByConnectionAndInstrument(this, (quote: IQuote) => {
        if (quote.updateType === UpdateType.Undefined) {
          if (quote.side === QuoteSide.Ask) {
            this.askPrice = this._formatter.format(quote.price);
            this.askVolume = quote.volume;
          } else {
            this.bidVolume = quote.volume;
            this.bidPrice = this._formatter.format(quote.price);
          }

          this._changeDetectorRef.detectChanges();
        }
      })),
      this._positionDatafeed.on(filterPositions(this, (pos, connectionId) => {
        this.position = RealPositionsRepository.transformPosition(pos, connectionId);
      })),
    );
  }

  // handleConnect(connection: IConnection) {
  //   super.handleConnect(connection);
  // }

  handleAccountChange(account: IAccount) {
    this.account = account;
    this.form.patchValue({ accountId: account?.id });
    this.loadData();
  }

  loadData() {
    const instrument = this.instrument;
    const connectionId = this.account?.connectionId;
    if (!instrument || !connectionId)
      return;

    this.unsubscribe(() => {
      this._levelOneDatafeed.unsubscribe(this.instrument, connectionId);
    });
    this._levelOneDatafeed.subscribe(this.instrument, connectionId);

    this.loadPositions();

    this.bidPrice = null;
    this.askPrice = null;
    this.askVolume = null;
    this.bidVolume = null;
  }

  getDto(): any {
    const dto = super.getDto();
    if (dto.type === OrderType.Limit) {
      dto.limitPrice = this.price;
    }
    if ([OrderType.StopLimit, OrderType.StopMarket].includes(dto.type)) {
      dto.stopPrice = this.price;
    }
    if (this.isStopLimit)
      dto.limitPrice = this.limitPrice;

    dto.accountId = this.accountId;
    return dto;
  }

  loadState(state: OrderFormState) {
    if (state?.link != null) {
      this.link = state.link;
    }
    if (state?.orderLink)
      this.orderLink = state.orderLink;
    if (state?.amountButtons)
      this.amountButtons = state.amountButtons;

    if (state?.instrument)
      this.instrument = state.instrument;
    else
      this.instrument = {
        id: 'ESM2.CME',
        description: 'E-Mini S&P 500 Jun22',
        exchange: 'CME',
        tickSize: 0.25,
        precision: 2,
        instrumentTimePeriod: 'Jun22',
        contractSize: 50,
        productCode: 'ES',
        symbol: 'ESM2',
      };

    if (state?.account)
      this.account = state.account;
  }

  handleLinkData({ instrument, account }) {
    if (instrument)
      this.instrument = instrument;
    if (account)
      this.account = account;
  }

  onTypeUpdated() {
    super.onTypeUpdated();
    if (this.isStopLimit) {
      this.layoutContainer.height = 348;
    } else {
      this.layoutContainer.height = 308;
    }
  }

  saveState(): OrderFormState {
    return { instrument: this.instrument, link: this.link, amountButtons: this.amountButtons, orderLink: this.orderLink };
  }

  closePositions() {
    this.positionsRepository.deleteMany({
      accountId: this.accountId,
      ...this._instrument,
    }).pipe(
      untilDestroyed(this)
    )
      .subscribe(
        () => this.notifier.showSuccess(null),
        (error) => this.notifier.showError(error),
      );
  }

  createForm() {
    return this.fb.group({
      accountId: [null],
      type: [OrderType.Limit],
      quantity: [1],
      exchange: this.instrument?.exchange,
      stopLoss: {
        stopLoss: false,
        ticks: 10,
        unit: 'ticks'
      },
      iceQuantity: [10],
      isIce: [false],
      takeProfit: {
        takeProfit: false,
        ticks: 10,
        unit: 'ticks'
      },
      symbol: this.instrument?.symbol,
      duration: [OrderDuration.GTC],
      side: [null],
      limitPrice: [null],
      stopPrice: [null],
    });
  }

  submit(side: OrderSide) {
    this.form.patchValue({ side });
    if (this.isOco) {
      this.submitOcoOrder(side);
      return;
    }

    this.apply();
  }

  submitOcoOrder(side: OrderSide) {
    if (!this.firstOcoOrder) {
      this.firstOcoOrder = this.getDto();
      this.ocoStep = OcoStep.Second;
    } else if (!this.secondOcoOrder) {
      this.secondOcoOrder = this.getDto();
      this.ocoStep = OcoStep.Second;
    }

    if (this.secondOcoOrder && this.firstOcoOrder) {
      this.firstOcoOrder.ocoOrder = this.secondOcoOrder;
      this._repository.createItem(this.firstOcoOrder)
        .pipe(untilDestroyed(this)).subscribe();
      this.ocoStep = OcoStep.None;
      this.secondOcoOrder = null;
      this.firstOcoOrder = null;
      this.isOco = false;
    }
    this.updateOrderTypes();
  }

  protected handleItem(item: IOrder): void {
    super.handleItem(item);
    this.needCreate = true;
    if (this.orderLink)
      this.broadcastData(this.orderLink, item);
  }

  updateQuantity(quantity: any) {
    this.form.patchValue({ quantity });
  }

  incrementQuantity() {
    if (typeof this.quantity === 'string')
      return;

    const quantity = this.quantity + 1;
    this.form.patchValue({ quantity });
  }

  decrementQuantity() {
    if (typeof this.quantity === 'string')
      return;

    const quantity = this.quantity - 1;
    if (quantity >= 1)
      this.form.patchValue({ quantity });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.unsubscribe();
  }

  increasePrice() {
    if (this.shouldDisablePrice)
      return;

    const currentPrice = this.price || 0;
    const tickSize = this.instrument?.tickSize || 1;
    const _newPrice = currentPrice + tickSize;
    const newPrice = NumberHelper.isDivisor(+currentPrice.toFixed(this.precision), tickSize) ? _newPrice :
      roundToTickSize(_newPrice, tickSize);

    this.price = +newPrice.toFixed(this.precision || 1);
    this.handlePriceChange();
  }

  decreasePrice() {
    if (this.shouldDisablePrice)
      return;

    const tickSize = this.instrument?.tickSize || 1;
    const currentPrice = this.price || 0;
    const _newPrice = currentPrice - tickSize;
    const newPrice = NumberHelper.isDivisor(+currentPrice.toFixed(this.precision), tickSize) ? _newPrice :
      roundToTickSize(_newPrice, tickSize, 'floor');

    if (newPrice >= 0)
      this.price = +newPrice.toFixed(this.precision || 1);

    this.handlePriceChange();
  }

  handlePriceChange(): void {
    this._storage.setItem(orderLastPriceKey, this.price);
  }


  handleLimitPriceChange(): void {
    this._storage.setItem(orderLastLimitKey, this.limitPrice);
  }

  private _getNavbarTitle(): string {
    if (this.instrument) {
      return `${this.instrument.symbol} - ${this.instrument.description}`;
    }
  }

  protected _handleSuccessCreate(response?) {
    if (response?.status === OrderStatus.Rejected)
      return;

    super._handleSuccessCreate(response);
  }

  createOco() {
    if (!this.isOco) {
      this.ocoStep = OcoStep.Fist;
      this.isOco = true;
      this.updateOrderTypes();
    }
    else {
      this.cancelOco();
    }
  }

  updateOrderTypes() {
    switch (this.ocoStep) {
      case OcoStep.Fist: {
        this.orderTypes = this.orderTypes.map(item => {
          item.disabled = OrderType.Limit !== item.value;
          return item;
        });
        this.form.patchValue({ type: OrderType.Limit });
        break;
      }
      case OcoStep.Second: {
        this.orderTypes = this.orderTypes.map(item => {
          item.disabled = ![OrderType.StopMarket, OrderType.StopLimit].includes(item.value);
          return item;
        });
        this.form.patchValue({ type: OrderType.StopMarket });
        break;
      }
      case OcoStep.None: {
        this.orderTypes = this.orderTypes.map(item => {
          item.disabled = false;
          return item;
        });
        break;
      }
    }
  }

  cancelOco() {
    if (this.isOco) {
      this.ocoStep = OcoStep.None;
      this.isOco = false;
      this.secondOcoOrder = null;
      this.firstOcoOrder = null;
      this.updateOrderTypes();
    }
  }
}
