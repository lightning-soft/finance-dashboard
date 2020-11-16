import { Component, Injector, OnInit } from '@angular/core';
import { ItemsComponent, ViewItemsBuilder } from 'base-components';
import { Id } from 'communication';
import { CellClickDataGridHandler } from 'data-grid';
import { LayoutComponent, LayoutNode } from 'layout';
import { DynamicComponentConfig, LoadingService } from 'lazy-modules';
import { IOrder, IOrderParams, OrdersFeed, OrdersRepository } from 'trading';
import { OrdersToolbarComponent, OrdersToolbarConfig } from './components/toolbar/orders-toolbar.component';
import { OrderItem } from './models/order.item';

@Component({
  selector: 'orders-list',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
@LayoutNode()
export class OrdersComponent extends ItemsComponent<IOrder, IOrderParams> implements OnInit {
  headers = [
    'averageFillPrice',
    'description',
    'duration',
    'filledQuantity',
    'quantity',
    'side',
    'status',
    'type',
    'exchange',
    'symbol',
    'fcmId',
    'ibId',
    'identifier',
    'close',
  ];

  builder = new ViewItemsBuilder();

  private _accountId;

  set accountId(accountId: Id) {
    this._accountId = accountId;
    this.loadData({ ...this.params, accountId });
  }

  get accountId() {
    return this._accountId;
  }

  _isList = false;

  layout: LayoutComponent;

  private _toolbarComponent: OrdersToolbarComponent;

  // private _status: OrderStatus = OrderStatus.Pending;

  // get status() {
  //   return this._status;
  // }

  // set status(value: OrderStatus) {
  //   if (value === this.status) {
  //     return;
  //   }
  //   this._status = value;
  //   this.refresh();
  // }

  get params(): IOrderParams {
    return {
      ...this._params,
      // status: this.status
    };
  }

  handlers = [
    new CellClickDataGridHandler<OrderItem>({
      column: 'close',
      handler: (item) => this.deleteItem(item.order),
    }),
  ];

  constructor(
    protected _repository: OrdersRepository,
    protected _injector: Injector,
    private _ordersFeed: OrdersFeed,
    private _loadingService: LoadingService,
  ) {
    super();
    this.autoLoadData = false;

    this.builder.setParams({
      order: 'desc',
      // filter: (order: IOrder) => order.status === this.status,
      map: (item: IOrder) => new OrderItem(item),
    });
  }

  ngOnInit() {
    this._ordersFeed.on((order) => {
      console.log('order', order);
      if (this.items.some(i => i.id === order.id))
        this.builder.handleUpdateItems([order]);
      else
        this.builder.handleCreateItems([order]);
    });
    super.ngOnInit();
  }

  async getToolbarComponent() {

    const toolbarConfig: OrdersToolbarConfig = {
      layout: this.layout,
      accountHandler: this.handleAccountChange.bind(this)
    };

    const { ref, domElement, destroy } = await this._loadingService
      .getDynamicComponent(OrdersToolbarComponent, [{
        provide: DynamicComponentConfig,
        useValue: { data: toolbarConfig },
      }]);

    this._toolbarComponent = ref.instance;

    // const subscription = ref.instance.handleChange.subscribe((link: number) => {
    //   instance.link = link;
    // });

    // container.on('destroy', () => {
    //   this._linkSelectMap.delete(container);

    //   subscription.unsubscribe();

    //   destroy();
    // });

    return domElement;
  }

  private handleAccountChange(accountId: Id): void {
    this.accountId = accountId;
  }

  protected _deleteItem(item: IOrder) {
    return this.repository.deleteItem(item);
  }

  protected _handleDeleteItems(items) {
    // handle by realtime
  }
}
