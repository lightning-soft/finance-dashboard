import { AfterViewInit, Component, ElementRef, HostBinding, Injector, OnDestroy, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { LazyLoadingService } from 'lazy-assets';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Themes, ThemesHandler } from 'themes';
import { Datafeed, RithmicDatafeed } from './datafeed';
import { IChart } from './models/chart';
import { IChartConfig } from './models/chart.config';
import { IScxComponentState } from './models/scx.component.state';
import { StockChartXPeriodicity } from './datafeed/TimeFrame';
import { LoadingService } from 'lazy-modules';
import { WindowToolbarComponent } from './window-toolbar/window-toolbar.component';
import { Orders, Positions } from './objects';
import { Id } from 'communication';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { AccountsManager } from '../../accounts-manager/src/accounts-manager';
import { Components } from 'src/app/modules';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { FormActions, getPriceSpecs, OcoStep, SideOrderFormComponent } from 'base-order-form';
import {
  IOrder,
  IQuote,
  Level1DataFeed,
  OrderSide,
  OrdersRepository,
  OrderType,
  PositionsRepository,
  QuoteSide,
  UpdateType
} from 'trading';
import { NotifierService } from 'notifier';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ConfirmOrderComponent } from './modals/confirm-order/confirm-order.component';
import { TradeDataFeed } from 'trading';

declare let StockChartX: any;
declare let $: JQueryStatic;

const EVENTS_SUFFIX = '.scxComponent';

// tslint:disable-next-line: no-empty-interface
export interface ChartComponent extends ILayoutNode {
}

@UntilDestroy()
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  providers: [
    { provide: Datafeed, useClass: RithmicDatafeed },
  ]
})
@LayoutNode()
export class ChartComponent implements AfterViewInit, OnDestroy {
  loading: boolean;

  @HostBinding('class.chart-unavailable') isChartUnavailable: boolean;
  @ViewChild('chartContainer')
  chartContainer: ElementRef;
  @ViewChild(ToolbarComponent) toolbar;
  chart: IChart;
  link: any;
  directions = ['window-left', 'window-right'];
  currentDirection = 'window-right';
  isTradingLocked = false;
  showChartForm = true;
  enableOrderForm = false;

  showOrderConfirm = true;

  ocoStep = OcoStep.None;
  buyOcoOrder: IOrder;
  sellOcoOrder: IOrder;

  @ViewChild(SideOrderFormComponent)
  private _sideForm: SideOrderFormComponent;

  showOHLC = true;
  showChanges = true;
  private _accountId: Id;

  get accountId(): Id {
    return this._accountId;
  }

  set accountId(value: Id) {
    this._accountId = value;
    this.refresh();
  }

  get instrument() {
    return this.chart?.instrument;
  }

  set instrument(value) {
    if (this.chart.instrument.symbol === value.symbol
      && this.chart.instrument.exchange === value.exchange)
      return;
    if (this.chart.instrument) {
      this._tradeDataFeed.unsubscribe(this.chart.instrument);
      this._levelOneDatafeed.unsubscribe(this.chart.instrument);
    }
    this.chart.instrument = value;
    this._tradeDataFeed.subscribe(this.chart.instrument);
    this._levelOneDatafeed.subscribe(this.chart.instrument);
    this.chart.incomePrecision = value.precision ?? 2;
    if (value) {
      value.company = this._getInstrumentCompany();
    }
    this.refresh();
  }

  private loadedState = new BehaviorSubject<IScxComponentState &
    {
      showOHLC: boolean, showChanges: boolean, showChartForm: boolean,
      showOrderConfirm: boolean, enableOrderForm: boolean
    }>(null);

  bestAskPrice: number;
  bestBidPrice: number;
  bidSize: number;
  askSize: number;

  private _orders: Orders;
  private _positions: Positions;
  @ViewChild('menu') menu: NzDropdownMenuComponent;

  constructor(
    public injector: Injector,
    protected _lazyLoaderService: LazyLoadingService,
    protected _themesHandler: ThemesHandler,
    protected _elementRef: ElementRef,
    private nzContextMenuService: NzContextMenuService,
    protected datafeed: Datafeed,
    private _ordersRepository: OrdersRepository,
    private _positionsRepository: PositionsRepository,
    protected _loadingService: LoadingService,
    protected _accountsManager: AccountsManager,
    private _tradeDataFeed: TradeDataFeed,
    private _levelOneDatafeed: Level1DataFeed,
    protected _notifier: NotifierService,
    private _modalService: NzModalService,
  ) {
    this.setTabIcon('icon-widget-chart');
    this.setNavbarTitleGetter(this._getNavbarTitle.bind(this));

    this._orders = new Orders(this);
    this._positions = new Positions(this);
    this.onRemove(this._levelOneDatafeed.on((quote: IQuote) => this._handleQuote(quote)));
    this._accountsManager.activeConnection
      .pipe(untilDestroyed(this))
      .subscribe((connection) => {
        this._ordersRepository = this._ordersRepository.forConnection(connection);
        this._positionsRepository = this._positionsRepository.forConnection(connection);
      });
  }

  protected loadFiles(): Promise<any> {
    return this._lazyLoaderService.load();
  }

  private _handleQuote(quote: IQuote) {
    if (quote.updateType === UpdateType.Undefined) {
      if (quote.side === QuoteSide.Ask) {
        this.bestAskPrice = quote.price;
        this.askSize = quote.volume;
      } else {
        this.bestBidPrice = quote.price;
        this.bidSize = quote.volume;
      }
    }
  }

  getQuoteInfo(info: number) {
    return info ?? '-';
  }

  async ngAfterViewInit() {
    this.loadFiles()
      .then(() => this.loadChart())
      .catch(e => console.error(e));
  }

  saveState() {
    const { chart } = this;
    if (!chart) {
      return;
    }

    return {
      showOHLC: this.showOHLC,
      showChanges: this.showChanges,
      showChartForm: this.showChartForm,
      enableOrderForm: this.enableOrderForm,
      link: this.link,
      showOrderConfirm: this.showOrderConfirm,
      instrument: chart.instrument,
      timeFrame: chart.timeFrame,
      stockChartXState: chart.saveState()
    };
  }


  private _instrumentChangeHandler = (event) => {
    this._setUnavaliableIfNeed();
    this.instrument = event.value;
    this.broadcastLinkData({
      instrument: {
        id: event.value.symbol,
      },
    });
  }

  loadChart() {
    const { loadedState } = this;
    const state = loadedState && loadedState.value;
    const chart = this.chart = this._initChart(state);
    this.showChanges = state?.showChanges;
    this.showOHLC = state?.showOHLC;
    this.enableOrderForm = state?.enableOrderForm;
    this.showChartForm = state?.showChartForm;
    if (state?.hasOwnProperty('showOrderConfirm'))
      this.showOrderConfirm = state?.showOrderConfirm;

    if (state?.hasOwnProperty('showChanges'))
      this.showChanges = state?.showChanges;
    if (state?.hasOwnProperty('showOHLC'))
      this.showOHLC = state?.showOHLC;
    this._setUnavaliableIfNeed();

    if (!chart) {
      return;
    }
    this._orders.init();
    this._positions.init();
    this.checkIfTradingEnabled();

    chart.showInstrumentWatermark = false;

    this._tradeDataFeed.subscribe(this.chart.instrument);
    this._levelOneDatafeed.subscribe(this.chart.instrument);

    chart.on(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, this._instrumentChangeHandler);
    chart.on(StockChartX.PanelEvent.CONTEXT_MENU, this._handleContextMenu);
    this._themesHandler.themeChange$
      .pipe(untilDestroyed(this))
      .subscribe(value => chart.theme = getScxTheme(value));

    this.loadedState
      .pipe(untilDestroyed(this))
      .subscribe(value => {
        if (!value) {
          return;
        }
        this.checkIfTradingEnabled();

        if (value.instrument && value.instrument.id != null) {
          chart.instrument = value.instrument; // todo: test it
        }

        if (value.timeFrame != null) {
          chart.timeFrame = value.timeFrame;
        }
        if (value.stockChartXState) {
          chart.loadState(value.stockChartXState);
        } else if (StockChartX.Indicator.registeredIndicators.VOL) {
          chart.addIndicators(new StockChartX.Indicator.registeredIndicators.VOL());
        }
        this.enableOrderForm = state?.enableOrderForm;
        this.showChartForm = state?.showChartForm;
        this.checkIfTradingEnabled();
      });

    this.broadcastData(this.link, chart);

    let charts = [];

    if (!environment.production) {
      if (!(window as any).charts) {
        (window as any).charts = [];
      }

      charts = (window as any).charts;
      charts.push(chart);
    }
  }

  getFormDTO() {
    return this._sideForm.getDto();
  }

  private _handleContextMenu = (e) => {
    const event = e.value.event.evt.originalEvent;
    this.nzContextMenuService.create(event, this.menu);
  }

  private _setUnavaliableIfNeed() {
    if (!this.chart) {
      return;
    }

    this.isChartUnavailable = this.chart.instrument && this.chart.instrument.id === null;
  }

  setNeedUpdate() {
    if (this.chart) {
      this.chart.setNeedsUpdate();
    }
  }

  protected _initChart(state?: IScxComponentState): any {
    StockChartX.Environment.Path.view = './assets/StockChartX/view/';
    StockChartX.Environment.Path.locales = './assets/StockChartX/locales/';

    const { chartContainer } = this;

    if (!chartContainer || !chartContainer.nativeElement) {
      return null;
    }

    return new StockChartX.Chart({
      container: $(chartContainer.nativeElement),
      keyboardEventsEnabled: false, // todo: handle key shortcut
      datafeed: this.datafeed,
      showToolbar: false,
      showScrollbar: false,
      allowReadMoreHistory: true,
      autoSave: false,
      autoLoad: false,
      showInstrumentWatermark: false,
      incomePrecision: state?.instrument.precision ?? 2,
      stayInDrawingMode: false,
      timeFrame: (state && state.timeFrame)
        ?? { interval: 1, periodicity: StockChartXPeriodicity.HOUR },
      instrument: (state && state.instrument) ?? {
        id: 'ESM1',
        symbol: 'ESM1',
        exchange: 'CME',
        tickSize: 0.25,
        precision: 2,
        company: this._getInstrumentCompany(),
      },
      theme: getScxTheme(this._themesHandler.theme),
    } as IChartConfig);
  }

  update(data: IChartConfig) {
    const { chart } = this;

    if (!chart || !data) {
      return;
    }
    const { instrument } = data;

    if (instrument) {
      chart.instrument = instrument;
    }

    chart.sendBarsRequest();
  }

  refresh() {
    const { chart } = this;

    if (!chart) {
      return;
    }

    if (chart.reload) {
      chart.reload();
    }
    this._positions.refresh();
    this._orders.refresh();
  }

  async getToolbarComponent() {
    const { domElement } = await this._loadingService
      .getDynamicComponent(WindowToolbarComponent);

    return domElement;
  }

  handleAccountChange(accountId: Id) {
    this.accountId = accountId;
  }

  handleNodeEvent(name: LayoutNodeEvent) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
      case LayoutNodeEvent.MakeVisible:
        this.setNeedUpdate();
        this.toolbar?.update();
        break;
      case LayoutNodeEvent.Move:
        this.toolbar.update();
        break;
    }
  }

  handleLinkData(data: any) {
    this.update(data);
  }

  private _getInstrumentCompany() {
    const connection = this._accountsManager.getActiveConnection();

    return (connection && connection.name) ?? '';
  }

  private _getNavbarTitle(): string {
    if (this.instrument) {
      const timeFrame = this.chart.timeFrame;
      let name = this.instrument.symbol;
      if (this.instrument.description) {
        name += ` - ${this.instrument.description}`;
      }
      name += `, ${timeFrame.interval}${transformPeriodicity(timeFrame.periodicity)}`;

      return name;
    }
  }


  loadState(state?: any) {
    this.link = state?.link ?? Math.random();

    this.loadedState.next(state);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy() {
    this._positions.destroy();
    this._orders.destroy();
    if (this.chart) {
      this._tradeDataFeed.unsubscribe(this.instrument);
      this._levelOneDatafeed.unsubscribe(this.instrument);
      this.chart.off(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, this._instrumentChangeHandler);
      this.chart.off(StockChartX.PanelEvent.CONTEXT_MENU, this._handleContextMenu);
      this.chart.destroy();
    }

    this.chart = null;
  }

  onWindowClose() {
    this.layout.removeComponents((item) => {
      const isIndicatorComponent = [Components.Indicators, Components.IndicatorList].includes(item.type);
      return isIndicatorComponent && item.options.componentState()?.state?.link === this.link;
    });
  }

  get positions() {
    return this._positions.items;
  }

  handleFormAction($event: FormActions) {
    switch ($event) {
      case FormActions.CreateOcoOrder:
        if (this.ocoStep === OcoStep.None)
          this.ocoStep = OcoStep.Fist;
        break;
      case FormActions.CancelOcoOrder:
        this.clearOcoOrders();
        break;
      case FormActions.CloseOrders:
        this._closeOrders();
        break;
      case FormActions.CloseBuyOrders:
        this._closeOrders(OrderSide.Buy);
        break;
      case FormActions.CloseSellOrders:
        this._closeOrders(OrderSide.Sell);
        break;
      case FormActions.CreateBuyMarketOrder:
        this.createOrder({ side: OrderSide.Buy, type: OrderType.Market });
        break;
      case FormActions.CreateSellMarketOrder:
        this.createOrder({ side: OrderSide.Sell, type: OrderType.Market });
        break;
      case FormActions.Flatten:
        this._closePositions();
        this._closeOrders();
        break;
      case FormActions.ClosePositions:
        this._closePositions();
        break;
    }
  }

  clearOcoOrders() {
    this.ocoStep = OcoStep.None;
    this.sellOcoOrder = null;
    this.buyOcoOrder = null;
    this._orders.clearOcoOrders();
  }

  createOrderWithConfirm(config: Partial<IOrder>) {
    if (this.isTradingLocked)
      return;
    if (this.showOrderConfirm) {
      const dto = this._sideForm.getDto();
      this._modalService.create({
        nzClassName: 'confirm-order',
        nzIconType: null,
        nzContent: ConfirmOrderComponent,
        nzFooter: null,
        nzComponentParams: {
          order: { ...dto, ...config },
        }
      }).afterClose.subscribe((res) => {
        if (res) {
          if (res.create)
            this.createOrder(config);
          this.showOrderConfirm = !res.dontShowAgain;
        }
      });
    } else {
      this.createOrder(config);
    }
  }

  createOrder(config: Partial<IOrder>) {
    if (this.isTradingLocked)
      return;
    const isOCO = this.ocoStep !== OcoStep.None;
    const dto = { ...this.getFormDTO(), ...config };
    const { exchange, symbol } = this.instrument;
    const priceSpecs = getPriceSpecs(dto, config.price, this.instrument.tickSize);
    const order = {
      ...dto,
      ...priceSpecs,
      exchange,
      symbol,
      accountId: this._accountId,
    };
    if (isOCO) {
      order.isOco = true;
      if (!this.sellOcoOrder && config.side === OrderSide.Sell) {
        this.sellOcoOrder = order;
        this._orders.createOcoOrder(order);
        this.ocoStep = this.ocoStep === OcoStep.None ? OcoStep.Fist : OcoStep.Second;
      }
      if (!this.buyOcoOrder && config.side === OrderSide.Buy) {
        this.buyOcoOrder = order;
        this._orders.createOcoOrder(order);
        this.ocoStep = this.ocoStep === OcoStep.None ? OcoStep.Fist : OcoStep.Second;
      }
      if (this.buyOcoOrder && this.sellOcoOrder) {
        this.buyOcoOrder.ocoOrder = this.sellOcoOrder;
        this._createOrder(this.buyOcoOrder);
        this.clearOcoOrders();
      }
      return;
    }
    this._createOrder(order);
  }

  openOrderPanel() {
    return this.layout.addComponent({
      component: {
        name: 'ordersPanel', state: {
          orders: this._orders.getOrders(),
        }
      },
      single: true,
      height: 400,
      width: 750,
      resizable: true,
      removeIfExists: true,
    });
  }

  private _createOrder(order) {
    this._ordersRepository.createItem(order).pipe(untilDestroyed(this))
      .subscribe(
        (res) => console.log('Order successfully created'),
        (err) => this._notifier.showError(err)
      );
  }

  private _closeOrders(side?: OrderSide) {
    const orders = this._orders.getOrders(side);
    this._ordersRepository.deleteMany(orders)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
      }, (err) => this._notifier.showError(err));

  }

  private _closePositions() {
    this._positionsRepository.deleteMany({
      accountId: this._accountId as string,
      ...this.instrument,
    }).pipe(untilDestroyed(this))
      .subscribe(
        () => {
        },
        (error) => this._notifier.showError(error),
      );
  }

  checkIfTradingEnabled() {
    this.chart.mainPanel.tradingPanel.visible = this.enableOrderForm;
    this.chart.mainPanel.orders.forEach(item => item.visible = this.enableOrderForm);
    this.setNeedUpdate();
  }
}

function getScxTheme(theme: Themes) {
  return theme === Themes.Light ? StockChartX.Theme.Light : StockChartX.Theme.Dark;
}


function transformPeriodicity(periodicity: string): string {
  switch (periodicity) {
    case '':
      return 'm';
    case 'h':
      return periodicity;
    default:
      return periodicity.toUpperCase();
  }
}
