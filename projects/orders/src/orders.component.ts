import { Component, Injector, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { ItemsComponent } from 'base-components';
import { Id } from 'communication';
import { LayoutComponent, LayoutNode } from 'layout';
import { DynamicComponentConfig, LoadingService } from 'lazy-modules';
import { IOrder, IOrderParams, LevelOneDataFeed, OrdersFeed, OrdersRepository } from 'trading';
import { OrdersToolbarComponent } from './components/toolbar/orders-toolbar.component';
import { OrderItem } from './models/OrderItem';

@UntilDestroy()
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
    'id'
  ];

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

  constructor(
    protected _repository: OrdersRepository,
    protected _injector: Injector,
    private _levelOneDatafeedService: LevelOneDataFeed,
    private _ordersFeed: OrdersFeed,
    private _loadingService: LoadingService,
    private _accountsManager: AccountsManager,
  ) {
    super();
    // this.autoLoadData = { onInit: true };
    this.autoLoadData = {};

    this.builder.setParams({
      order: 'desc',
      // filter: (order: IOrder) => order.status === this.status,
      map: (item: IOrder) => new OrderItem(item),
    });
  }

  ngOnInit() {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();
        this._repository = this._repository.forConnection(connection);
      });

    this._ordersFeed.on((order) => {
      console.log('order', order);
      // if (this.items.some(i => i.id === order.id))
      //   this.builder.handleUpdateItems([order]);
      // else
      //   this.builder.handleCreateItems([order]);
    });
    super.ngOnInit();
  }

  async getToolbarComponent() {

    const { ref, domElement, destroy } = await this._loadingService
      .getDynamicComponent(OrdersToolbarComponent, [{
        provide: DynamicComponentConfig,
        useValue: {
          data: { layout: this.layout },
        },
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

  handleAccountChange(accountId: Id): void {
    this.accountId = accountId;
  }
}
