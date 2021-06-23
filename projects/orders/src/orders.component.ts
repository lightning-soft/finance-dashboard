import { AfterViewInit, Component, HostBinding, Injector, ViewChild } from '@angular/core';
import { convertToColumn, HeaderItem, RealtimeGridComponent } from 'base-components';
import { OrderColumn, OrderItem } from 'base-order-form';
import { IPaginationResponse } from 'communication';
import {CellClickDataGridHandler, CellStatus, CheckboxCell, Column, DataGrid, DataGridHandler} from 'data-grid';
import { LayoutNode } from 'layout';
import { AccountsListener, IAccountsListener } from 'real-trading';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Components } from 'src/app/modules';
import {
  IAccount,
  IOrder,
  IOrderParams,
  OrdersFeed,
  OrderSide,
  OrdersRepository,
  OrderStatus,
  OrderType,
  TradeDataFeed, TradePrint
} from 'trading';
import { ViewFilterItemsBuilder } from '../../base-components/src/components/view-filter-items.builder';
import { generateNewStatusesByPrefix } from 'data-grid';

export interface OrdersComponent extends RealtimeGridComponent<IOrder, IOrderParams> {
}

enum Tab {
  Working,
  Filled,
  All
}

const allTypes = 'All';
const orderWorkingStatuses: OrderStatus[] = [OrderStatus.Pending, OrderStatus.New, OrderStatus.PartialFilled];

@Component({
  selector: 'orders-list',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
@LayoutNode()
@AccountsListener()
export class OrdersComponent extends RealtimeGridComponent<IOrder, IOrderParams> implements AfterViewInit, IAccountsListener {
  @ViewChild('grid', { static: false }) dataGrid: DataGrid;

  columns: Column[];
  orderTypes = [allTypes, ...Object.values(OrderType)];
  orderStatuses = ['Show All', ...Object.values(OrderStatus)];
  cancelMenuOpened = false;

  builder = new ViewFilterItemsBuilder<IOrder, OrderItem>();
  activeTab: Tab = Tab.All;
  selectedOrders: IOrder[] = [];
  contextMenuState = {
    showHeaderPanel: true,
    showColumnHeaders: true,
  };

  gridStyles = {
    gridHeaderBorderColor: '#24262C',
    gridBorderColor: 'transparent',
    gridBorderWidth: 0,
    rowHeight: 25,
    rowOffset: 1,
  };

  private _headerCheckboxCell = new CheckboxCell();

  readonly orderType = OrderType;
  readonly tab = Tab;
  readonly headers: HeaderItem<OrderColumn>[] = [
    {
      name: OrderColumn.checkbox,
      title: ' ',
      width: 30,
      draw: this._headerCheckboxCell.draw.bind(this._headerCheckboxCell),
      hidden: true
    },
    { name: OrderColumn.accountId, title: 'ACCOUNT', tableViewName: 'Account' },
    OrderColumn.symbol,
    OrderColumn.exchange,
    OrderColumn.description,
    OrderColumn.side,
    OrderColumn.type,
    { name: OrderColumn.quantity, title: 'Quantity' },
    { name: OrderColumn.filledQuantity, title: 'QTY FILLED', tableViewName: 'Quantity Filled' },
    { name: OrderColumn.quantityRemain, title: 'QTY REMAIN', tableViewName: 'Quantity Remaining' },
    { name: OrderColumn.price, title: 'Price' },
    { name: OrderColumn.triggerPrice, title: 'TRIG Price', tableViewName: 'Trigger Price' },
    { name: OrderColumn.duration, title: 'tif', tableViewName: 'TIF' },
    { name: OrderColumn.currentPrice, title: 'Cur Price', tableViewName: 'Current Price' },
    { name: OrderColumn.averageFillPrice, title: 'AVG FILL', tableViewName: 'Average Fill Price' },
    OrderColumn.status,
    // OrderColumn.fcmId,
    // OrderColumn.ibId,
    { name: OrderColumn.identifier, title: 'ORDER ID', tableViewName: 'Order ID' },
    // OrderColumn.close,
  ];

  get orders(): IOrder[] {
    return this.items.map(i => i.order);
  }

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

  handlers: DataGridHandler[] = [
    new CellClickDataGridHandler<OrderItem>({
      column: OrderColumn.close,
      handler: (data) => this.deleteItem(data.item.order),
    }),
    new CellClickDataGridHandler<OrderItem>({
      column: OrderColumn.checkbox,
      handleHeaderClick: true,
      handler: (data, event) => {
        data.item ? data.item.toggleSelect(event) : this.handleHeaderCheckboxClick(event);
        this.selectedOrders = this.items.filter(i => i.isSelected).map(i => i.order);
      },
    })
  ];

  @HostBinding('class.hide-header')
  get hideHeaderPanel() {
    return !this.contextMenuState?.showHeaderPanel;
  }

  constructor(
    protected _repository: OrdersRepository,
    protected _injector: Injector,
    protected _dataFeed: OrdersFeed,
    private _tradeDataFeed: TradeDataFeed,
  ) {
    super();
    this.autoLoadData = false;

    this.builder.setParams({
      order: 'asc',
      wrap: (item: IOrder) => new OrderItem(item),
      unwrap: (item: OrderItem) => item.order,
      addNewItems: 'start',
    });

    this.columns = this.headers.map(i => convertToColumn(i, {
      ...generateNewStatusesByPrefix({
        buyColor: 'rgba(72, 149, 245, 1)',
        sellColor: 'rgba(220, 50, 47, 1)',
        selectedbuyColor: 'rgba(72, 149, 245, 1)',
        selectedsellColor: 'rgba(220, 50, 47, 1)',
        selectedbuyBackgroundColor: '#383A40',
        selectedsellBackgroundColor: '#383A40',
      }, CellStatus.Hovered),
      hoveredBackgroundColor: '#2B2D33',
      hoveredbuyBackgroundColor: '#2B2D33',
      hoveredsellBackgroundColor: '#2B2D33',
      textOverflow: true,
      textAlign: 'left',
    }));
    const column = this.columns.find(i => i.name == OrderColumn.description);
    column.style = { ...column.style, textOverflow: true };
    const checkboxColumn = this.columns.find((item) => item.name === OrderColumn.checkbox);
    checkboxColumn.tableViewName = 'Checkbox';
    this.setTabIcon('icon-widget-orders');
    this.setTabTitle('Orders');
  }

  handleAccountsConnect(accounts: IAccount[], connectedAccounts: IAccount[]) {
    this.repository.getItems({ accounts }).subscribe(
      res => this.builder.addItems(res.data),
      err => this.showError(err),
    );
  }

  handleAccountsDisconnect(accounts: IAccount[], connectedAccounts: IAccount[]) {
    this.builder.removeWhere(i => accounts.some(a => a.id === i.accountId.value));
  }

  changeActiveTab(tab: Tab): void {
    this.activeTab = tab;

    switch (tab) {
      case Tab.All:
        this.builder.setParams({ viewItemsFilter: null });
        break;
      case Tab.Filled:
        this.builder.setParams({ viewItemsFilter: i => i.order.status === OrderStatus.Filled });
        break;
      case Tab.Working:
        this.builder.setParams({ viewItemsFilter: i => orderWorkingStatuses.includes(i.order.status) });
        break;
    }
  }

  protected _handleResponse(response: IPaginationResponse<IOrder>, params: any = {}) {
    super._handleResponse(response, params);
    this.updateCheckboxState(this.contextMenuState);
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
    return { ...this.dataGrid.saveState() };
  }

  loadState(state): void {
    if (state && state.columns) {
      this.columns = state.columns;
      const checkboxColumn = state.columns.find(i => i.name === OrderColumn.checkbox);
      checkboxColumn.draw = this._headerCheckboxCell.draw.bind(this._headerCheckboxCell);
    }

    if (state) {
      const { contextMenuState } = state;
      this.contextMenuState = contextMenuState;
    }
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

  handleHeaderCheckboxClick(event: MouseEvent): void {
    if (this._headerCheckboxCell.toggleSelect(event)) {
      this.items.forEach(item => item.updateSelect(this._headerCheckboxCell.checked));
    }
  }

  repriceSelectedOrdersByTickSize(up: boolean): void {
    const requests: Observable<IOrder>[] = [];

    this.selectedOrders.forEach(order => {
      if (orderWorkingStatuses.includes(order.status)) {
        requests.push(this._repository.updateItem(this._getRepricedOrderByTickSize(order, up)));
      }
    });

    if (requests.length) {
      const hide = this.showLoading();
      forkJoin(requests)
        .pipe(finalize(hide))
        .subscribe((orders) => {
          this._handleUpdateItems(orders);
        }, error => {
          this.showError(error, 'Failed to update order');
        });
    }
  }

  duplicateSelectedOrder(): void {
    const order = this.selectedOrders[0];

    if (order) {
      order.accountId = order.account.id;
      order.symbol = order.instrument.symbol;
      order.exchange = order.instrument.exchange;

      const hide = this.showLoading();
      this._repository.createItem(order)
        .pipe(finalize(hide))
        .subscribe((data) => {
          this._handleCreateItems([data]);
        }, error => {
          this.showError(error, 'Failed to create order');
        });
    }
  }

  handleUpdateColumn(column: Column): void {
    if (column.name === 'checkbox') {
      this.items.forEach(i => i.changeCheckboxHorizontalAlign(column.style.textAlign));
    }
  }

  private _getRepricedOrderByTickSize(order: IOrder, up: boolean): IOrder {
    const updatedOrder = { ...order };
    const tickSize = order.instrument.increment ?? 0.25;

    if ([OrderType.Limit, OrderType.StopLimit].includes(order.type)) {
      updatedOrder.limitPrice += up ? tickSize : -tickSize;
    }
    if ([OrderType.StopMarket, OrderType.StopLimit].includes(order.type)) {
      updatedOrder.stopPrice += up ? tickSize : -tickSize;
    }

    return updatedOrder;
  }

  cancelAllOrders(): void {
    this.cancelOrders(this.orders);
  }

  cancelBuyOrders(): void {
    this.cancelOrders(this.orders.filter(i => i.side === OrderSide.Buy));
  }

  cancelSellOrders(): void {
    this.cancelOrders(this.orders.filter(i => i.side === OrderSide.Sell));
  }

  cancelOrdersByType(orderType: OrderType): void {
    this.cancelOrders(this.orders.filter(i => i.type === orderType));
  }

  cancelSelectedOrders(): void {
    this.cancelOrders(this.selectedOrders);
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

  updateCheckboxState(value) {
    this.items.forEach(item => {
      item.checkbox.showColumnPanel = value.showColumnHeaders;
    });
  }

  protected _subscribeToDataFeed() {
    super._subscribeToDataFeed();

    this.addUnsubscribeFn(this._tradeDataFeed.on((data: TradePrint) => {
      this.items.forEach((item: OrderItem) => {
        if (item.order.instrument.id === data.instrument.id)
          item.setCurrentPrice(data.price);
      });
    }));
  }
}
