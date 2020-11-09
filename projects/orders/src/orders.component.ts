import { Component, Injector } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ItemsComponent } from 'base-components';
import { LevelOneDataFeedService, OrdersRepository } from 'communication';
import { LayoutComponent, LayoutNode } from 'layout';
import { DynamicComponentConfig, LoadingService } from 'lazy-modules';
import { IOrder, IOrderParams, OrderStatus } from 'trading';
import { OrdersToolbarComponent } from './components/toolbar/orders-toolbar.component';
import { OrderItem } from './models/OrderItem';

@UntilDestroy()
@Component({
  selector: 'orders-list',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
@LayoutNode()
export class OrdersComponent extends ItemsComponent<IOrder, IOrderParams> {
  headers = ['symbol', 'side', 'size', 'executed', 'price', 'priceIn', 'status', 'type'];

  _isList = false;

  layout: LayoutComponent;

  private _toolbarComponent: OrdersToolbarComponent;

  private _status: OrderStatus = OrderStatus.Pending;

  get status() {
    return this._status;
  }

  set status(value: OrderStatus) {
    if (value === this.status) {
      return;
    }
    this._status = value;
    this.refresh();
  }

  get params(): IOrderParams {
    return { ...this._params, status: this.status };
  }

  constructor(
    protected _repository: OrdersRepository,
    protected _injector: Injector,
    private _levelOneDatafeedService: LevelOneDataFeedService,
    private _loadingService: LoadingService,
  ) {
    super();
    this.autoLoadData = { onInit: true };

    this.builder.setParams({
      order: 'desc',
      filter: (order: IOrder) => order.status === this.status,
      map: (item: IOrder) => new OrderItem(item),
    });
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
}
