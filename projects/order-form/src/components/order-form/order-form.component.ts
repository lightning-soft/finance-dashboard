import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { FormComponent } from 'base-components';
import { IPaginationResponse } from 'communication';
import {
  AccountRepository, IAccount, IInstrument, IOrder, LevelOneDataFeedService,
  ITrade, OrderDuration, OrderSide, OrdersRepository, OrderType
} from 'trading';

enum DynamicControl {
  LimitPrice = 'limitPrice',
  StopPrice = 'stopPrice'
}

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
@UntilDestroy()
export class OrderFormComponent extends FormComponent<IOrder> implements OnInit {
  OrderDurations = Object.values(OrderDuration);
  OrderTypes = Object.values(OrderType);
  step = 1;
  OrderSide = OrderSide;

  bidPrice;
  askPrice;

  get volume() {
    return this.form.value.size;
  }

  private _instrument: IInstrument;

  accounts: IAccount[] = [];

  @Input()
  set instrument(value: IInstrument) {
    if (value?.id === this.instrument?.id)
      return;

    const prevInstrument = this._instrument;
    this._instrument = value;
    this._handleInstrumentChange(this._instrument, prevInstrument);
  }

  get instrument(): IInstrument {
    return this._instrument;
  }

  constructor(
    protected fb: FormBuilder,
    protected _repository: OrdersRepository,
    protected _levelOneDatafeedService: LevelOneDataFeedService,
    protected _accountsRepository: AccountRepository,
    protected _accountsManager: AccountsManager,
    protected _injector: Injector,
  ) {
    super();
    this.autoLoadData = false;
  }

  ngOnInit() {
    super.ngOnInit();

    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();
        this._accountsRepository = this._accountsRepository.forConnection(connection);
        this._repository = this._repository.forConnection(connection);
      });

    this.instrument = {
      id: 'ESZ0',
      symbol: 'ESZ0',
      exchange: 'CME',
      tickSize: 1,
    };

    this._accountsRepository.getItems({ status: 'Active' })
      .pipe(untilDestroyed(this))
      .subscribe((response: IPaginationResponse<IAccount>) => {
        this.accounts = response.data;
        const account = this.accounts[0];
        this.form.patchValue({ accountId: account?.id });
      });

    this._levelOneDatafeedService.on((trade: ITrade) => {
      if (trade?.Instrument?.Symbol !== this.instrument?.symbol
        || isNaN(trade.BidInfo.Price)
        || isNaN(trade.AskInfo.Price)) return;


      this.askPrice = trade.AskInfo.Price;
      this.bidPrice = trade.BidInfo.Price;
    });
  }

  private _handleInstrumentChange(instrument: IInstrument, prevInstrument: IInstrument) {
    this.bidPrice = '-';
    this.askPrice = '-';
    this._levelOneDatafeedService.subscribe([instrument]);
    this._levelOneDatafeedService.unsubscribe([prevInstrument]);
  }

  createForm() {
    const fb = this.fb;
    return fb.group(
      {
        accountId: fb.control(null, Validators.required),
        symbol: fb.control(null, Validators.required),
        type: fb.control(OrderType.Market, Validators.required),
        quantity: fb.control(this.step, Validators.min(this.step)),
        duration: fb.control(OrderDuration.GTC, Validators.required),
        side: fb.control(null, Validators.required),
        limitPrice: fb.control(null),
        stopPrice: fb.control(null),
        price: fb.control(null),
      }
    );
  }

  apply(e?) {
    super.apply(e);
  }

  addVolume(value) {
    let volume = +(value + this.volume).toFixed(1);
    if (volume < this.step)
      volume = this.step;

    this.form.patchValue({ size: volume });
  }

  submit(side: OrderSide) {
    const price = side === OrderSide.Buy ? this.bidPrice : this.askPrice;
    this.form.patchValue({ side, price, symbol: this.instrument.id });
    this.apply();
  }

  getDto() {
    let dto: IOrder;

    dto = this.getRawValue();
    dto = this.filterByOrderType(dto);

    return dto;
  }

  private filterByOrderType(order: IOrder): IOrder {
    const result = Object.assign({}, order);
    const orderType = order.type;

    if (orderType !== OrderType.Limit && orderType !== OrderType.StopLimit)
      delete result[DynamicControl.LimitPrice];

    if (orderType !== OrderType.StopMarket && orderType !== OrderType.StopLimit)
      delete result[DynamicControl.StopPrice];

    return result;
  }

  protected handleItem(item: IOrder): void {
    super.handleItem(item);

    this.needCreate = true;
  }
}
