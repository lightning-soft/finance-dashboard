import { Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BindUnsubscribe, IUnsubscribe, NumberHelper } from 'base-components';
import { BaseOrderForm, orderDurations, orderTypes, QuantityInputComponent } from 'base-order-form';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { filterByConnectionAndInstrument, RealPositionsRepository } from 'real-trading';
import { Storage } from 'storage';
import {
  compareInstruments, IAccount, IInstrument,
  IOrder, IQuote, Level1DataFeed,
  OrderDuration,
  OrderSide,
  OrdersRepository, OrderStatus,
  OrderType,
  PositionsFeed, PositionsRepository, QuoteSide, roundToTickSize, UpdateType
} from 'trading';

const orderLastPriceKey = 'orderLastPrice';
const orderLastLimitKey = 'orderLastLimitKey';

interface OrderFormState {
  instrument: IInstrument;
  link: string | number;
  orderLink?: string;
  account?: IAccount;
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

  get isStopLimit() {
    return OrderType.StopLimit === this.formValue.type;
  }

  @ViewChild(QuantityInputComponent) quantityInput: QuantityInputComponent;

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

    const connectionId = this.account?.connectionId;
    this._levelOneDatafeed.unsubscribe(value, connectionId);

    this.unsubscribe(() => {
      this._levelOneDatafeed.unsubscribe(value, connectionId);
    });

    this._instrument = value;

    if (this.price)
      this.price = roundToTickSize(this.price, this._instrument.tickSize);

    const { symbol, exchange } = value;
    this.form?.patchValue({ symbol, exchange });

    this.loadPositions();

    this.bidPrice = null;
    this.askPrice = null;
    this.askVolume = null;
    this.bidVolume = null;
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
  orderTypes = orderTypes;
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

  readonly priceFormatter = (price: number) => Number(price).toFixed(this.precision);

  constructor(
    protected fb: FormBuilder,
    protected _repository: OrdersRepository,
    protected positionsRepository: PositionsRepository,
    private _levelOneDatafeed: Level1DataFeed,
    private _positionDatafeed: PositionsFeed,
    private _storage: Storage,
    protected _injector: Injector
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
        if (quote.updateType === UpdateType.Undefined && quote.instrument?.symbol === this.instrument?.symbol) {
          if (quote.side === QuoteSide.Ask) {
            this.askPrice = quote.price.toFixed(this.precision);
            this.askVolume = quote.volume;
          } else {
            this.bidVolume = quote.volume;
            this.bidPrice = quote.price.toFixed(this.precision);
          }
        }
      })),
      this._positionDatafeed.on((pos) => {
        const position = RealPositionsRepository.transformPosition(pos);

        if (compareInstruments(position.instrument, this.instrument)) {
          this.position = position;
        }
      })
    );
  }

  // handleConnect(connection: IConnection) {
  //   super.handleConnect(connection);
  // }

  handleAccountChange(account: IAccount) {
    this.account = account;
    this.form.patchValue({ accountId: account?.id });
    this.loadPositions();
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
    if (state?.orderLink) {
      this.orderLink = state.orderLink;
    }
    if (state?.instrument)
      this.instrument = state.instrument;
    else
      this.instrument = {
        id: 'ESM1',
        description: 'E-Mini S&P 500',
        exchange: 'CME',
        tickSize: 0.25,
        precision: 2,
        symbol: 'ESM1',
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
    return { instrument: this.instrument, link: this.link, orderLink: this.orderLink };
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

    this.apply();
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
  }

  increasePrice() {
    if (this.shouldDisablePrice)
      return;

    const currentPrice = this.price || 0;
    const tickSize = this.instrument?.tickSize || 0.1;
    const _newPrice = currentPrice + tickSize;
    const newPrice = NumberHelper.isDivisor(+currentPrice.toFixed(this.precision), tickSize) ? _newPrice :
      roundToTickSize(_newPrice, tickSize);

    this.price = +newPrice.toFixed(this.precision);
    this.handlePriceChange();
  }

  decreasePrice() {
    if (this.shouldDisablePrice)
      return;

    const tickSize = this.instrument?.tickSize || 0.1;
    const currentPrice = this.price || 0;
    const _newPrice = currentPrice - tickSize;
    const newPrice = NumberHelper.isDivisor(+currentPrice.toFixed(this.precision), tickSize) ? _newPrice :
      roundToTickSize(_newPrice, tickSize, 'floor');

    if (newPrice >= 0)
      this.price = +newPrice.toFixed(this.precision);

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
}
