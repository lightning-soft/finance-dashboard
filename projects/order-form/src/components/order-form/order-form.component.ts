import { Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { BaseOrderForm, orderTypes, QuantityInputComponent, orderDurations } from 'base-order-form';
import { Id } from 'communication';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import {
  IInstrument,
  IOrder, IQuote, Level1DataFeed,
  OrderDuration,
  OrderSide,
  OrdersRepository,
  OrderType,
  PositionsRepository, QuoteSide, UpdateType, PositionsFeed, compareInstruments, roundToTickSize
} from 'trading';
import { RealPositionsRepository } from 'real-trading';
import { Storage } from 'storage';
import { NumberHelper } from 'base-components';

const orderLastPriceKey = 'orderLastPrice';
const orderLastLimitKey = 'orderLastLimitKey';

interface OrderFormState {
  instrument: IInstrument;
  link: string | number;
  orderLink?: string;
}

export interface OrderFormComponent extends ILayoutNode {
}

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
@UntilDestroy()
@LayoutNode()
export class OrderFormComponent extends BaseOrderForm implements OnInit, OnDestroy, IStateProvider<OrderFormState> {

  get isStopLimit() {
    return OrderType.StopLimit === this.formValue.type;
  }

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

    this._levelOneDatafeed.unsubscribe(this._instrument);
    this._levelOneDatafeed.subscribe(value);

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

  @ViewChild(QuantityInputComponent) quantityInput: QuantityInputComponent;

  private _instrument: IInstrument;

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
    // protected _levelOneDatafeedService: Level1DataFeed,
    private _levelOneDatafeed: Level1DataFeed,
    private _positionDatafeed: PositionsFeed,
    private _storage: Storage,
    protected _accountsManager: AccountsManager,
    protected _injector: Injector
  ) {
    super();
    this.autoLoadData = false;

    this.setTabIcon('icon-widget-create-orders');
    this.setNavbarTitleGetter(this._getNavbarTitle.bind(this));
    this.price = this._storage.getItem(orderLastPriceKey) ?? 1;
    this.limitPrice = this._storage.getItem(orderLastLimitKey) ?? 1;
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
  }

  handleLinkData({ instrument }) {
    if (instrument)
      this.instrument = instrument;
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

  ngOnInit() {
    super.ngOnInit();
    this.onTypeUpdated();
    this._accountsManager.activeConnection
      .pipe(untilDestroyed(this))
      .subscribe((connection) => {
        this._repository = this._repository.forConnection(connection);
        this.positionsRepository = this.positionsRepository.forConnection(connection);
      });

    this.onRemove(
      this._levelOneDatafeed.on((quote: IQuote) => {
        if (quote.updateType === UpdateType.Undefined && quote.instrument?.symbol === this.instrument?.symbol) {
          if (quote.side === QuoteSide.Ask) {
            this.askPrice = quote.price.toFixed(this.precision);
            this.askVolume = quote.volume;
          } else {
            this.bidVolume = quote.volume;
            this.bidPrice = quote.price.toFixed(this.precision);
          }
        }
      }),
      this._positionDatafeed.on((pos) => {
        const position = RealPositionsRepository.transformPosition(pos);
        if (compareInstruments(position.instrument, this.instrument))
          this.position = position;

      })
    );
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

  handleAccountChange(accountId: Id): void {
    this.form.patchValue({ accountId });
    this.loadPositions();
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
    this._levelOneDatafeed.unsubscribe(this.instrument);
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
      return `${ this.instrument.symbol } - ${ this.instrument.description }`;
    }
  }
}
