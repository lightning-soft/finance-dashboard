import { AfterViewInit, Component, ElementRef, HostBinding, Injector, Input, OnDestroy, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { BindUnsubscribe, IUnsubscribe } from 'base-components';
import { FormActions, getPriceSpecs, OcoStep, SideOrderFormComponent } from 'base-order-form';
import { IChartState, IChartTemplate } from 'chart/models';
import { ExcludeId } from 'communication';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { LazyLoadingService } from 'lazy-assets';
import { LoadingService } from 'lazy-modules';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NotifierService } from 'notifier';
import { BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { TradeHandler } from 'src/app/components';
import { Components } from 'src/app/modules';
import { environment } from 'src/environments/environment';
import { TemplatesService } from 'templates';
import { Themes, ThemesHandler } from 'themes';
import {
  compareInstruments,
  IAccount,
  IHistoryItem, IOrder,
  IPosition,
  IQuote,
  Level1DataFeed,
  OHLVFeed,
  OrderSide,
  OrdersRepository,
  OrderType,
  PositionsRepository,
  QuoteSide,
  UpdateType
} from 'trading';
import { CreateModalComponent } from 'ui';
import { IWindow, WindowManagerService } from "window-manager";
import { Datafeed, RithmicDatafeed } from './datafeed';
import { StockChartXPeriodicity } from './datafeed/TimeFrame';
import { ConfirmOrderComponent } from './modals/confirm-order/confirm-order.component';
import { IChart } from './models/chart';
import { IChartConfig } from './models/chart.config';
import { IScxComponentState } from './models/scx.component.state';
import { Orders, Positions } from './objects';
import { ToolbarComponent } from './toolbar/toolbar.component';

declare let StockChartX: any;
declare let $: JQueryStatic;

const EVENTS_SUFFIX = '.scxComponent';

// tslint:disable-next-line: no-empty-interface
export interface ChartComponent extends ILayoutNode, IUnsubscribe {
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
@BindUnsubscribe()
export class ChartComponent implements AfterViewInit, OnDestroy {
  loading: boolean;

  @HostBinding('class.chart-unavailable') isChartUnavailable: boolean;
  @ViewChild('chartContainer')
  chartContainer: ElementRef;
  @ViewChild(ToolbarComponent) toolbar;
  @ViewChild(SideOrderFormComponent) private _sideForm: SideOrderFormComponent;

  @Input() window: IWindow;


  chart: IChart;
  link: any;
  directions = ['window-left', 'window-right'];
  currentDirection = 'window-right';
  showChartForm = true;
  enableOrderForm = false;
  showOrderConfirm = true;

  ocoStep = OcoStep.None;
  buyOcoOrder: IOrder;
  sellOcoOrder: IOrder;

  lastHistoryItem: Partial<IHistoryItem> = null;
  income: number;
  incomePercentage: number;

  showOHLV = true;
  showChanges = true;
  private _templatesSubscription: Subscription;

  private _account: IAccount;

  set account(value: IAccount) {
    this._account = value;
    this.datafeed.changeAccount(value);
    this.refresh();
  }

  get account() {
    return this._account;
  }

  get accountId() {
    return this.account?.id;
  }

  get instrument() {
    return this.chart?.instrument;
  }

  set instrument(instrument) {
    if (this.chart.instrument.id === instrument.id)
      return;

    this.position = this._positions.items.find((item) => compareInstruments(item.instrument, this.instrument));
    this.chart.instrument = instrument;
    this.chart.incomePrecision = instrument.precision ?? 2;

    this.refresh();

    this.lastHistoryItem = null;
    this.income = null;
    this.incomePercentage = null;
    this._updateOHLVData();

    const connectionId = this.account.connectionId;

    this._ohlvFeed.subscribe(instrument, connectionId);
    this._levelOneDatafeed.subscribe(instrument, connectionId);

    this.unsubscribe(() => {
      this._ohlvFeed.unsubscribe(instrument, connectionId);
      this._levelOneDatafeed.unsubscribe(instrument, connectionId);
    });
  }

  private _loadedState$ = new BehaviorSubject<IScxComponentState &
  {
    showOHLV: boolean, showChanges: boolean, showChartForm: boolean,
    showOrderConfirm: boolean, enableOrderForm: boolean, orderForm: any
  }>(null);
  loadedTemplate: IChartTemplate;
  isTradingEnabled = true;

  private _loadedChart$ = new ReplaySubject<IChart>(1);

  loadedChart$ = this._loadedChart$.asObservable()
    .pipe(untilDestroyed(this));

  bestAskPrice: number;
  bestBidPrice: number;
  bidSize: number;
  askSize: number;

  position: IPosition;
  private _orders: Orders;
  private _positions: Positions;

  get orders() {
    return this._orders.items;
  }

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
    private _ohlvFeed: OHLVFeed,
    private _levelOneDatafeed: Level1DataFeed,
    protected _notifier: NotifierService,
    private _modalService: NzModalService,
    private _templatesService: TemplatesService,
    private _tradeHandler: TradeHandler,
    private _windowManager: WindowManagerService
  ) {
    this.setTabIcon('icon-widget-chart');
    this.setNavbarTitleGetter(this._getNavbarTitle.bind(this));

    this._orders = new Orders(this);
    this._positions = new Positions(this);
  }

  async ngAfterViewInit() {
    this.window = this._windowManager.getWindowByComponent(this);

    this.loadFiles()
      .then(() => this.loadChart())
      .catch(e => console.error(e));

    this._tradeHandler.isTradingEnabled$
      .pipe(untilDestroyed(this))
      .subscribe((enabled) => this.isTradingEnabled = enabled);

    this._templatesSubscription = this._templatesService.subscribe((data) => {
      if (this.loadedTemplate)
        this.loadedTemplate = data.items.find(i => this.loadedTemplate.id === i.id);
    });
  }

  private _updateOHLVData() {
    if (this.lastHistoryItem?.open != null) {
      this.income = this.lastHistoryItem.close - this.lastHistoryItem.open;
      const incomePercentage = (this.income / this.lastHistoryItem.open) * 100;
      this.incomePercentage = incomePercentage != null ? +incomePercentage.toFixed(2) : null;
    }
    this.chart.updateOHLVData({
      volume: this.lastHistoryItem?.volume,
      high: this.lastHistoryItem?.high,
      low: this.lastHistoryItem?.low,
      open: this.lastHistoryItem?.open,
      income: this.income,
      incomePercentage: this.incomePercentage,
    });
  }

  protected loadFiles(): Promise<any> {
    return this._lazyLoaderService.load();
  }

  private _handleOHLV(historyItem) {
    if (!this.instrument || !compareInstruments(historyItem.instrument, this.instrument))
      return;

    this.lastHistoryItem = historyItem;
    this._updateOHLVData();

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

  toggleTrading(): void {
    if (!this.isTradingEnabled) {
      this._tradeHandler.enableTrading();
    } else {
      this.isTradingEnabled = false;
    }
  }

  getQuoteInfo(info: number) {
    return info?.toFixed(this.instrument?.precision ?? 2) ?? '-';
  }

  getQuoteSize(info: number) {
    return info ?? '-';
  }

  saveState(): IChartState {
    const { chart } = this;

    if (!chart) {
      return;
    }

    return {
      showOHLV: this.showOHLV,
      showChanges: this.showChanges,
      showChartForm: this.showChartForm,
      enableOrderForm: this.enableOrderForm,
      link: this.link,
      showOrderConfirm: this.showOrderConfirm,
      instrument: chart.instrument,
      timeFrame: chart.timeFrame,
      stockChartXState: chart.saveState(),
      orderForm: this._sideForm.getState(),
    } as IChartState;
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
    const state = this._loadedState$.value;
    const chart = this.chart = this._initChart(state);
    this.showChanges = state?.showChanges;
    this.showOHLV = state?.showOHLV;
    this.enableOrderForm = state?.enableOrderForm;
    this.showChartForm = state?.showChartForm;
    if (state?.hasOwnProperty('showOrderConfirm'))
      this.showOrderConfirm = state?.showOrderConfirm;

    if (state?.hasOwnProperty('showChanges'))
      this.showChanges = state?.showChanges;
    if (state?.hasOwnProperty('showOHLV'))
      this.showOHLV = state?.showOHLV;
    this._setUnavaliableIfNeed();

    if (!chart) {
      return;
    }

    this._orders.init();
    this._positions.init();

    this.checkIfTradingEnabled();

    chart.showInstrumentWatermark = false;

    this.instrument = this.chart.instrument;

    chart.on(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, this._instrumentChangeHandler);
    chart.on(StockChartX.PanelEvent.CONTEXT_MENU, this._handleContextMenu);
    this._themesHandler.themeChange$
      .pipe(untilDestroyed(this))
      .subscribe(value => chart.theme = getScxTheme(value));

    this.refresh();

    this._loadedState$
      .pipe(untilDestroyed(this))
      .subscribe(state => {
        if (!state) {
          return;
        }
        this.checkIfTradingEnabled();

        if (state.instrument && state.instrument.id != null) {
          this.instrument = state.instrument; // todo: test it
        }

        if (state.timeFrame != null) {
          chart.timeFrame = state.timeFrame;
        }
        if (state.stockChartXState) {
          chart.loadState(state.stockChartXState);
        } else if (StockChartX.Indicator.registeredIndicators.VOL) {
          chart.addIndicators(new StockChartX.Indicator.registeredIndicators.VOL());
        }

        this._sideForm.loadState(state?.orderForm);
        this.enableOrderForm = state?.enableOrderForm;
        this.showChartForm = state?.showChartForm;
        this.checkIfTradingEnabled();
      });

    this._loadedChart$.next(chart);

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
      showToolbar: false,
      showScrollbar: false,
      allowReadMoreHistory: true,
      autoSave: false,
      autoLoad: false,
      showInstrumentWatermark: false,
      incomePrecision: state?.instrument.precision ?? 2,
      stayInDrawingMode: false,
      datafeed: this.datafeed,
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

  update(data) {
    const { chart } = this;

    if (!chart || !data) {
      return;
    }

    const { instrument, account } = data;

    if (instrument) {
      this.instrument = instrument;
    }
    if (account) {
      this.account = account;
    }

    chart.sendBarsRequest();
  }

  refresh() {
    const { chart } = this;

    if (!chart || !this.instrument || !this._account) {
      return;
    }

    if (chart.reload) {
      chart.reload();
    }
    this._positions.refresh();
    this._orders.refresh();
  }

  handleNodeEvent(name: LayoutNodeEvent) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
      case LayoutNodeEvent.MakeVisible:
        this.setNeedUpdate();
        this.toolbar?.updateOffset();
        break;
      case LayoutNodeEvent.Move:
        this.toolbar.updateOffset();
        break;
    }
  }

  handleLinkData(data: any) {
    this.update(data);
  }

  private _getInstrumentCompany() {
    return '';
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

  loadState(state?: IChartState): void {
    this.link = state?.link ?? Math.random();
    this._loadedState$.next(state);
    this._sideForm?.loadState(state?.orderForm);
    if (state?.account) {
      this.account = state.account;
    }
  }

  loadTemplate(template: IChartTemplate): void {
    this.loadedTemplate = template;
    this.loadState(template.state);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy() {
    this._positions.destroy();
    this._orders.destroy();
    this._templatesSubscription.unsubscribe();

    if (this.chart) {
      this.chart.off(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, this._instrumentChangeHandler);
      this.chart.off(StockChartX.PanelEvent.CONTEXT_MENU, this._handleContextMenu);
      this.chart.destroy();
    }

    this.unsubscribe();
    this.chart = null;
  }

  onWindowClose() {
    this.layout.removeComponents((item) => {
      const isIndicatorComponent = [Components.Indicators, Components.IndicatorList].includes(item.type);
      return item.visible && isIndicatorComponent && (item.options.componentState()?.state?.link === this.link);
    });
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
    if (!this.isTradingEnabled)
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
    if (!this.isTradingEnabled)
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
      accountId: this.accountId,
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
      accountId: this.accountId,
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

  saveTemplate(): void {
    if (!this.loadedTemplate)
      return;

    const template: IChartTemplate = {
      state: this.saveState(),
      tabState: this.getTabState(),
      id: this.loadedTemplate.id,
      name: this.loadedTemplate.name,
      type: Components.Chart
    };

    this._templatesService.updateItem(template).subscribe(() => {
      this.loadedTemplate = template;
    }, error => this._notifier.showError(error, 'Failed to save Template'));
  }

  createTemplate(): void {
    const modal = this._modalService.create({
      nzWidth: 440,
      nzTitle: 'Save as',
      nzContent: CreateModalComponent,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        name: 'Template name',
      },
    });

    modal.afterClose.subscribe(result => {
      if (!result)
        return;

      const template: ExcludeId<IChartTemplate> = {
        state: this.saveState(),
        tabState: this.getTabState(),
        name: result.name,
        type: Components.Chart
      };
      this._templatesService.createItem(template).subscribe((template) => {
        this.loadedTemplate = template;
      }, error => this._notifier.showError(error, 'Failed to create Template'));
    });
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
