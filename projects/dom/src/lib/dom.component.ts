import { AfterViewInit, Component, ElementRef, Injector, OnInit, Renderer2, ViewChild } from '@angular/core';
import { LoadingComponent } from 'base-components';
import { CellClickDataGridHandler, Column, DataGrid, IFormatter, IViewBuilderStore, RoundFormatter } from 'data-grid';
import { ILayoutNode, IStateProvider, LayoutNode, LayoutNodeEvent } from 'layout';
import { SynchronizeFrames } from 'performance';
import { IConnection, IInstrument, ITrade, L2, Level1DataFeed, Level2DataFeed, OrdersRepository } from 'trading';
import { DomSettingsSelector } from './dom-settings/dom-settings.component';
import { DomSettings } from './dom-settings/settings';
import { DomItem } from './dom.item';
import { DomHandler } from './handlers';
import { histogramComponent, HistogramComponent } from './histogram';
import { DomFormComponent } from './dom-form/dom-form.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { NotifierService } from 'notifier';
import { OrderSide } from 'trading';
import { Id } from 'communication';

export interface DomComponent extends ILayoutNode, LoadingComponent<any, any> {
}

interface IDomState {
  instrument: IInstrument;
  settings?: any;
}

@Component({
  selector: 'lib-dom',
  templateUrl: './dom.component.html',
  styleUrls: ['./dom.component.scss'],
  providers: [
    {
      provide: IViewBuilderStore,
      useValue: {
        [histogramComponent]: HistogramComponent
      }
    }
  ]
})
@LayoutNode()
export class DomComponent extends LoadingComponent<any, any> implements OnInit, AfterViewInit, IStateProvider<IDomState> {
  columns: Column[] = [
    // '_id',
    'orders',
    'volumeProfile',
    'price',
    'bidDelta',
    'bid',
    'ltq',
    'currentBid',
    'currentAsk',
    'ask',
    'askDelta',
    'totalBid',
    'totalAsk',
    'tradeColumn',
    'askDepth',
    'bidDepth',
  ].map(name => ({ name, visible: true }));
  accountId: Id;

  private _dom = new DomHandler();

  @ViewChild(DomFormComponent)
  private _domForm: DomFormComponent;

  handlers = [
    ...['bid', 'ask'].map(column => (
      new CellClickDataGridHandler<DomItem>({
        column, handler: (item) => this._createOrder(column, item),
      })
    )),
  ];


  directions = ['window-left', 'full-screen-window', 'window-right'];
  currentDirection = this.directions[this.directions.length - 1];
  @ViewChild(DataGrid)
  dataGrid: DataGrid;

  @ViewChild(DataGrid, { read: ElementRef })
  dataGridElement: ElementRef;

  isFormOpen = true;
  isLocked: boolean;

  private _scrolledItems = 0;
  private _instrument: IInstrument;

  private _priceFormatter: IFormatter;

  public get instrument(): IInstrument {
    return this._instrument;
  }

  public set instrument(value: IInstrument) {
    if (this._instrument?.id == value.id)
      return;

    this._instrument = value;
    this._priceFormatter = new RoundFormatter(3);
    this._levelOneDatafeed.subscribe(value);
    this._levelTwoDatafeed.subscribe(value);
  }

  visibleRows = 0;

  items = [];

  private _trade: ITrade;

  get trade() {
    return this._trade;
  }

  private _settings: DomSettings = new DomSettings();


  constructor(
    private _ordersRepository: OrdersRepository,
    private _levelOneDatafeed: Level1DataFeed,
    protected _accountsManager: AccountsManager,
    protected _notifier: NotifierService,
    private _levelTwoDatafeed: Level2DataFeed,
    protected _injector: Injector,
    private _renderer: Renderer2
  ) {
    super();
    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Dom');
  }

  ngOnInit(): void {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const connection = this._accountsManager.getActiveConnection();
        this._ordersRepository = this._ordersRepository.forConnection(connection);
      });
    this.onRemove(
      this._levelOneDatafeed.on((trade: ITrade) => this._handleTrade(trade)),
      this._levelTwoDatafeed.on((item: L2) => this._handleL2(item))
    );

    this.addLinkObserver({
      link: DomSettingsSelector,
      handleLinkData: (settings) => {
        this._settings.merge(settings);
      }
    });
  }

  protected _handleConnection(connection: IConnection) {
    super._handleConnection(connection);
    this._ordersRepository = this._ordersRepository.forConnection(connection);
  }

  scroll = (e: WheelEvent) => {
    if (e.deltaY > 0) {
      this._scrolledItems++;
    } else if (e.deltaY < 0) {
      this._scrolledItems--;
    }
    this._calculate();
  }


  ngAfterViewInit() {
    this._handleResize();
    const element = this.dataGridElement && this.dataGridElement.nativeElement;
    this.onRemove(this._renderer.listen(element, 'wheel', this.scroll));
  }

  detectChanges() {
    this.dataGrid.detectChanges();
  }

  @SynchronizeFrames()
  private _calculateAsync() {
    this._calculate();
    this.dataGrid.detectChanges();
  }

  protected _handleTrade(trade: ITrade) {
    if (trade.instrument?.symbol !== this.instrument?.symbol) return;
    this._trade = trade;
    this._dom.handleTrade(trade);
    this._calculateAsync();
  }

  protected _handleL2(l2: L2) {
    if (l2.instrument?.symbol !== this.instrument?.symbol) return;
    this._dom.handleL2(l2);
    this._calculateAsync();
  }

  private _calculate(move?: number) {
    const itemsCount = this.visibleRows;

    const trade = this._trade;
    const instrument = this.instrument;
    if (!instrument)
      return;

    const last = trade && trade.price;
    const centerIndex = Math.floor((itemsCount - 1) / 2) + this._scrolledItems;
    // const tickSize = instrument.tickSize;
    const tickSize = 0.01;
    const step = instrument.precision;
    const data: DomItem[] = this.items;
    let upIndex = centerIndex - 1;
    let downIndex = centerIndex + 1;
    let price = last + this._scrolledItems * tickSize;
    let item: DomItem;
    const dom = this._dom;

    if (last == null || isNaN(last))
      return;

    if (centerIndex >= 0 && centerIndex < itemsCount) {
      item = data[centerIndex];
      item.updatePrice(last, dom, true);
    }

    while (upIndex >= 0) {
      price = sum(price, tickSize, step);
      if (upIndex >= itemsCount) {
        upIndex--;
        continue;
      }

      item = data[upIndex];
      item.updatePrice(price, dom);
      upIndex--;
    }

    price = last;

    while (downIndex <= itemsCount - 1) {
      price = sum(price, -tickSize, step);
      if (downIndex < 0) {
        downIndex++;
        continue;
      }

      item = data[downIndex];
      item.updatePrice(price, dom);
      downIndex++;
    }
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
        this._handleResize();
        break;
    }

    return true;
  }

  @SynchronizeFrames()
  private _handleResize() {

    const data = this.items;
    const visibleRows = this.visibleRows = this.dataGrid.getVisibleRows();

    if (data.length === visibleRows)
      return;

    if (data.length > visibleRows)
      data.splice(visibleRows, data.length - visibleRows);
    else if (data.length < visibleRows)
      while (data.length <= visibleRows)
        data.push(new DomItem(data.length, this._settings, this._priceFormatter));

    this.detectChanges();
  }

  saveState?(): IDomState {
    return {
      instrument: this.instrument,
      settings: this._settings.toJson()
    };
  }

  loadState?(state: IDomState) {
    this._settings = state?.settings ? DomSettings.fromJson(state.settings) : new DomSettings();
    this.openSettings(true);

    // for debug purposes
    if (!state)
      state = {} as any;

    if (!state?.instrument)
      state.instrument = {
        id: 'ESH1',
        description: 'E-Mini S&P 500',
        exchange: 'CME',
        tickSize: 0.25,
        precision: 2,
        symbol: 'ESH1',
      };
    // for debug purposes


    if (!state?.instrument)
      return;

    this.instrument = state.instrument;
  }

  openSettings(hidden = false) {
    this.layout.addComponent({
      component: {
        name: DomSettingsSelector,
        state: this._settings,
      },
      closeBtn: true,
      single: !hidden,
      removeIfExists: !hidden,
      hidden,
    });
  }

  private _createOrder(column: string, item: DomItem) {
    if (!this._domForm.valid) {
      this.notifier.showError('Please fill all required fields in form');
      return;
    }
    const side = column === 'bid' ? OrderSide.Buy : OrderSide.Sell;
    const requestPayload = this._domForm.getDto();
    const { exchange, symbol } = this.instrument;
    requestPayload.stopPrice = requestPayload.sl.count;
    requestPayload.limitPrice = requestPayload.tp.count;
    this._ordersRepository.createItem({
      ...requestPayload,
      exchange,
      side,
      accountId: this.accountId,
      symbol
    }).toPromise()
      .then((res) => {
        this.notifier.showSuccess('Order successfully created');
      })
      .catch((err) => {
        this.notifier.showError(err);
      });
  }

  ngOnDestroy() {
    const instrument = this.instrument;
    if (!instrument)
      return;

    this._levelOneDatafeed.unsubscribe(instrument);
    this._levelTwoDatafeed.unsubscribe(instrument);
  }
}

export function sum(num1, num2, step = 1) {
  step = Math.pow(10, step);
  return (Math.round(num1 * step) + Math.round(num2 * step)) / step;
}
