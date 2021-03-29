import { Component, HostBinding, Injector } from '@angular/core';
import { RealtimeGridComponent, StringHelper, ViewItemsBuilder } from 'base-components';
import { Id, IPaginationResponse } from 'communication';
import { CellClickDataGridHandler, CheckboxCell, Column } from 'data-grid';
import { LayoutNode } from 'layout';
import { Components } from 'src/app/modules';
import { IOrder, IOrderParams, OrdersFeed, OrdersRepository, OrderStatus, OrderType } from 'trading';
import { OrdersToolbarComponent } from './components/toolbar/orders-toolbar.component';
import { OrderItem } from './models/order.item';
import { finalize } from 'rxjs/operators';


type HeaderItem = [string, string, IHeaderItemOptions?] | string;

interface IHeaderItemOptions {
  style?: any;
  width?: number;
  drawObject?: { draw(context): boolean }
}

export interface OrdersComponent extends RealtimeGridComponent<IOrder, IOrderParams> {
}

const allTypes = 'All';
const allStatuses = 'Show All';

@Component({
  selector: 'orders-list',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
@LayoutNode()
export class OrdersComponent extends RealtimeGridComponent<IOrder, IOrderParams> {
  headerCheckboxCell = new CheckboxCell();
  readonly headers: (HeaderItem | string)[] = [
    ['checkbox', ' ', { width: 30, drawObject: this.headerCheckboxCell }],
    ['averageFillPrice', 'Average Fill Price'],
    'description',
    'duration',
    ['filledQuantity', 'Filled Quantity'],
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
  columns: Column[];
  orderTypes = ['All', ...Object.values(OrderType)];
  orderStatuses = ['Show All', ...Object.values(OrderStatus)];
  orderWorkingStatuses = ['Pending', 'New', 'PartialFilled'];
  cancelMenuOpened = false;

  orderStatus = allStatuses;
  orderType = allTypes;

  builder = new ViewItemsBuilder<IOrder, OrderItem>();

  get items(): any[] {
    const items = this.builder.items;
    if (!items)
      return [];

    return this.orderStatus === 'Working' ?
      items.filter(item => this.orderWorkingStatuses.filter(status => item.order.status === status).length > 0) :
      items.filter(item => this.orderStatus === allStatuses || item.order.status === this.orderStatus)
  }

  private _accountId;

  set accountId(accountId: Id) {
    this._accountId = accountId;
    this.loadData({ ...this.params, accountId });
  }

  get accountId() {
    return this._accountId;
  }

  _isList = false;

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
    new CellClickDataGridHandler<OrderItem>({
      column: 'checkbox',
      handleHeaderClick: true,
      handler: (item, event) => {
        item ? item.toggleSelect(event) : this.handleHeaderCheckboxClick(event);
      },
    })
  ];
  @HostBinding('class.show-header')
  showHeaderPanel = true;

  constructor(
    protected _repository: OrdersRepository,
    protected _injector: Injector,
    protected _dataFeed: OrdersFeed,
  ) {
    super();
    this.autoLoadData = false;

    this.builder.setParams({
      order: 'asc',
      wrap: (item: IOrder) => new OrderItem(item),
      unwrap: (item: OrderItem) => item.order,
      addNewItems: 'start',
    });

    this.columns = this.headers.map((nameOrArr: HeaderItem) => {
      nameOrArr = Array.isArray(nameOrArr) ? nameOrArr : ([nameOrArr, nameOrArr, {}]);
      const [name, title, options] = nameOrArr;

      const column: Column = {
        name,
        title: title.toUpperCase(),
        tableViewName: StringHelper.capitalize(name),
        style: {
          ...options?.style,
          buyColor: 'rgba(72, 149, 245, 1)',
          sellColor: 'rgba(220, 50, 47, 1)',
          selectedbuyColor: 'rgba(72, 149, 245, 1)',
          selectedsellColor: 'rgba(220, 50, 47, 1)',
          selectedBackgroundColor: '#383A40',
          selectedbuyBackgroundColor: '#383A40',
          selectedsellBackgroundColor: '#383A40',
          textOverflow: true,
          textAlign: 'left',
        },
        visible: true,
        width: options?.width
      };

      if (options?.drawObject) {
        column.draw = (context) => options.drawObject.draw(context)
      }

      return column;
    });
    const column = this.columns.find(i => i.name == 'description');
    column.style = { ...column.style, textOverflow: true };
    const checkboxColumn = this.columns.find((item) => item.name === 'checkbox');
    checkboxColumn.tableViewName = 'Checkbox';
    this.setTabIcon('icon-widget-orders');
    this.setTabTitle('Orders');
  }

  changeTab(status: string) {
    this.orderStatus = status;
  }

  protected _handleResponse(response: IPaginationResponse<IOrder>, params: any = {}) {
    super._handleResponse(response, params);
    this.updateTitle();
  }

  handleAccountChange(accountId: Id): void {
    this.accountId = accountId;
  }

  protected _deleteItem(item: IOrder) {
    return this.repository.deleteItem(item);
  }

  protected _showSuccessDelete() {
    // handle by realtime
  }

  protected _handleDeleteItems(items) {
    // handle by realtime
  }

  saveState() {
    return { columns: this.columns };
  }

  loadState(state): void {
    this._subscribeToConnections();

    if (state && state.columns)
      this.columns = state.columns;
  }

  openOrderForm() {
    this.layout.addComponent({
      component: { name: Components.OrderForm },
      minHeight: 315,
      minWidth: 369,
      height: 315,
      width: 369,
      maximizable: false,
    });
  }

  updateTitle() {
    setTimeout(() => this.setTabTitle(`Orders (${this.items.length})`));
  }

  handleHeaderCheckboxClick(event: MouseEvent): void {
    if (this.headerCheckboxCell.toggleSelect(event)) {
      this.items.forEach(item => item.updateSelect(this.headerCheckboxCell.checked));
    }
  }

  cancelAllOrders(): void {
    const selectedOrders = this.items.map(i => i.order);
    this.cancelOrders(selectedOrders);
  }

  cancelSelectedOrders(): void {
    const selectedOrders = this.items.filter(i => i.isSelected).map(i => i.order);
    this.cancelOrders(selectedOrders);
  }

  cancelOrders(orders: IOrder[]): void {
    const hide = this.showLoading();
    this._repository.deleteMany(orders)
      .pipe(finalize(hide))
      .subscribe({
          next: () => {
            this._handleDeleteItems(orders);
            this._showSuccessDelete();
          },
          error: (error) => this._handleDeleteError(error)
        }
      );
  }
}
