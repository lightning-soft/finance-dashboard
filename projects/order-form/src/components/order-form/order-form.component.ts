import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { FormComponent } from 'base-components';
import { Id } from 'communication';
import { ILayoutNode, LayoutNode } from 'layout';
import {
  IInstrument, IOrder,
  ITrade, Level1DataFeed,
  OrderDuration, OrderSide, OrdersRepository, OrderType
} from 'trading';

export interface OrderFormComponent extends ILayoutNode { }

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
@UntilDestroy()
@LayoutNode()
export class OrderFormComponent extends FormComponent<IOrder> implements OnInit {
  OrderDurations = Object.values(OrderDuration);
  OrderTypes = Object.values(OrderType);
  step = 1;
  OrderSide = OrderSide;

  bidPrice: number;
  askPrice: number;

  private _instrument: IInstrument;

  @Input()
  set instrument(value: IInstrument) {
    if (value?.id === this.instrument?.id)
      return;

    this._levelOneDatafeedService.unsubscribe(this._instrument);
    this._levelOneDatafeedService.subscribe(value);

    this._instrument = value;

    this.bidPrice = null;
    this.askPrice = null;
  }

  get instrument(): IInstrument {
    return this._instrument;
  }

  constructor(
    protected fb: FormBuilder,
    protected _repository: OrdersRepository,
    protected _levelOneDatafeedService: Level1DataFeed,
    protected _accountsManager: AccountsManager,
    protected _injector: Injector
  ) {
    super();
    this.autoLoadData = false;

    this.setTabIcon('icon-widget-create-orders');
    this.setTabTitle('Orders Ticket');
  }

  ngOnInit() {
    super.ngOnInit();

    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();
        this._repository = this._repository.forConnection(connection);
      });

    this.onRemove(this._levelOneDatafeedService.on((trade: ITrade) => {
      if (trade.instrument?.symbol !== this.instrument?.symbol) return;

      this.askPrice = trade.askInfo.price;
      this.bidPrice = trade.bidInfo.price;
    }));
  }

  createForm() {
    return this.fb.group({
      accountId: [null],
      type: [OrderType.Market],
      quantity: [1],
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
  }

  getDto(): IOrder {
    const order = this.getRawValue();
    const orderType = order.type;

    order.symbol = this.instrument?.symbol;
    order.exchange = this.instrument?.exchange;

    // if (orderType !== OrderType.Limit && orderType !== OrderType.StopLimit)
    //   delete order.limitPrice;

    // if (orderType !== OrderType.StopMarket && orderType !== OrderType.StopLimit)
    //   delete order.stopPrice;

    return order;
  }

  protected handleItem(item: IOrder): void {
    super.handleItem(item);

    this.needCreate = true;
  }
}
