import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BindUnsubscribe, IUnsubscribe } from 'base-components';
import { FormActions, OcoStep, SideOrderFormComponent } from 'base-order-form';
import { IChartState, IChartTemplate } from 'chart/models';
import { ExcludeId } from 'communication';
import { KeyBinding, KeyboardListener } from 'keyboard';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { LazyLoadingService } from 'lazy-assets';
import { LoadingService } from 'lazy-modules';
import * as clone from 'lodash.clonedeep';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NotifierService } from 'notifier';
import { filterByConnectionAndInstrument } from 'real-trading';
import { BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { TradeHandler } from 'src/app/components';
import { Components } from 'src/app/modules';
import { environment } from 'src/environments/environment';
import { TemplatesService } from 'templates';
import { ThemesHandler } from 'themes';
import {
  compareInstruments,
  getPriceSpecs,
  IAccount,
  IHistoryItem,
  IOrder,
  IPosition,
  IQuote,
  ISession,
  Level1DataFeed,
  OHLVFeed,
  OrderSide,
  OrdersRepository,
  OrderType,
  PositionsRepository,
  QuoteSide,
  UpdateType
} from 'trading';
import { ConfirmModalComponent, CreateModalComponent, RenameModalComponent } from 'ui';
import { IWindow, WindowManagerService } from 'window-manager';
import {
  chartReceiveKey,
  chartSettings,
  defaultChartSettings,
  IChartSettings,
  IsAutomaticPixelPrice
} from './chart-settings/settings';
import { Datafeed, RithmicDatafeed } from './datafeed';
import { StockChartXPeriodicity } from './datafeed/TimeFrame';
import { InfoComponent } from './info/info.component';
import { ConfirmOrderComponent } from './modals/confirm-order/confirm-order.component';
import { IChart } from './models/chart';
import { IChartConfig } from './models/chart.config';
import { IScxComponentState } from './models/scx.component.state';
import { Orders, Positions } from './objects';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { customVolumeProfileSettings } from './volume-profile-custom-settings/volume-profile-custom-settings.component';
import {
  IVolumeTemplate,
  VolumeProfileTemplatesRepository
} from './volume-profile-custom-settings/volume-profile-templates.repository';
import { RoundFormatter } from 'data-grid';

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
  private _formatter = new RoundFormatter(2);

  @HostBinding('class.chart-unavailable') isChartUnavailable: boolean;
  @ViewChild('chartContainer')
  chartContainer: ElementRef;
  @ViewChild(ToolbarComponent) toolbar;
  @ViewChild(SideOrderFormComponent) private _sideForm: SideOrderFormComponent;

  session: ISession;

  @Input() window: IWindow;

  chart: IChart;
  link: string;
  activeIndicator: any;

  get chartLink() {
    return `chart-${this.link}`;
  }

  keysStack: KeyboardListener = new KeyboardListener();

  directions = ['window-left', 'window-right'];
  currentDirection = 'window-right';
  showChartForm = true;
  enableOrderForm = false;
  showOrderConfirm = true;
  showCancelConfirm = true;

  ocoStep = OcoStep.None;
  firstOcoOrder: IOrder;
  secondOcoOrder: IOrder;

  lastHistoryItem: Partial<IHistoryItem> = null;
  income: number;
  incomePercentage: number;

  showOHLV = true;
  showChanges = true;
  private _templatesSubscription: Subscription;

  private _account: IAccount;
  settings: IChartSettings;

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
    if (this.chart.instrument?.id === instrument.id)
      return;

    this._formatter.updateDigits(instrument?.precision ?? 2);
    this.position = this._positions.items.find((item) => compareInstruments(item.instrument, this.instrument));
    this.chart.instrument = instrument;
    this.chart.incomePrecision = instrument.precision ?? 2;

    this.refresh();

    this.lastHistoryItem = null;
    this.income = null;
    this.incomePercentage = null;
    this._updateOHLVData();

    const connectionId = this.account?.connectionId;

    if (connectionId != null) {
      this._ohlvFeed.subscribe(instrument, connectionId);
      this._levelOneDatafeed.subscribe(instrument, connectionId);
    }
    this.unsubscribe(() => {
      this._ohlvFeed.unsubscribe(instrument, connectionId);
      this._levelOneDatafeed.unsubscribe(instrument, connectionId);
    });
  }

  private _loadedState$ = new BehaviorSubject<IChartState>(null);
  loadedTemplate: IChartTemplate;
  isTradingEnabled = true;

  loadedCustomeVolumeTemplate: any;

  private _loadedChart$ = new ReplaySubject<IChart>(1);

  @ViewChild(InfoComponent)
  info: InfoComponent;

  position: IPosition;
  private _orders: Orders;
  private _positions: Positions;
  componentInstanceId = Date.now();

  get orders() {
    return this._orders.items;
  }

  @ViewChild('menu') menu: NzDropdownMenuComponent;

  contextEvent: MouseEvent;

  _customeVolumeSetting: any;

  constructor(
    public injector: Injector,
    protected _lazyLoaderService: LazyLoadingService,
    protected _themesHandler: ThemesHandler,
    private nzContextMenuService: NzContextMenuService,
    protected datafeed: Datafeed,
    private _ordersRepository: OrdersRepository,
    private _positionsRepository: PositionsRepository,
    protected _loadingService: LoadingService,
    private _zone: NgZone,
    private _ohlvFeed: OHLVFeed,
    private _levelOneDatafeed: Level1DataFeed,
    protected _notifier: NotifierService,
    private _modalService: NzModalService,
    private _templatesService: TemplatesService,
    private _tradeHandler: TradeHandler,
    private _windowManager: WindowManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _volumeProfileTemplatesRepository: VolumeProfileTemplatesRepository
  ) {
    this.setTabIcon('icon-widget-chart');
    this.setNavbarTitleGetter(this._getNavbarTitle.bind(this));

    this._orders = new Orders(this);
    this._positions = new Positions(this);
    this.onRemove(
      this._ohlvFeed.on(filterByConnectionAndInstrument(this, (ohlv) => this._handleOHLV(ohlv))),
      this._levelOneDatafeed.on(filterByConnectionAndInstrument(this, (quote) => this._handleQuote(quote))),
    );
  }

  createCustomVolumeProfile(template: IVolumeTemplate): void {
    const indicator = new StockChartX.CustomVolumeProfile();

    this.chart.addIndicators(indicator);
    indicator.start();

    if (template?.settings) {
      indicator.settings = template.settings;
      indicator.templateId = template.id;
    }

    this.chart.setNeedsUpdate();
  }

  removeCustomeVolumeProfile(): void {
    this.chart.removeIndicators(this.activeIndicator);
    this.chart.setNeedsUpdate();
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

    this._loadTemplateList();
    this._subscribeToHotKey();
  }

  private _updateOHLVData() {
    if (this.lastHistoryItem?.open != null) {
      this.income = +(this.lastHistoryItem.close - this.lastHistoryItem.open).toFixed(this.instrument.precision);
      const incomePercentage = (this.income / this.lastHistoryItem.open) * 100;
      this.incomePercentage = incomePercentage != null ? +incomePercentage.toFixed(2) : null;
    }
    this.chart.updateOHLVData({
      volume: this.lastHistoryItem?.volume,
      high:  this._formatter.format(this.lastHistoryItem?.high),
      low: this._formatter.format(this.lastHistoryItem?.low),
      open: this._formatter.format(this.lastHistoryItem?.open),
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
    if (quote.updateType !== UpdateType.Undefined)
      return;

    const bestQuote = { price: this.getQuoteInfo(quote.price), volume: quote.volume };
    if (quote.side === QuoteSide.Ask) {
      this.info.handleBestAsk(bestQuote);
    } else {
      this.info.handleBestBid(bestQuote);
    }
  }

  toggleTrading(): void {
    if (!this.isTradingEnabled) {
      this._tradeHandler.enableTrading();
      this.isTradingEnabled = true;
    } else {
      this.isTradingEnabled = false;
      this._tradeHandler.showDisableTradingAlert();
    }
  }

  getQuoteInfo(info: number) {
    return info?.toFixed(this.instrument?.precision ?? 2);
  }

  getQuoteSize(info: number) {
    return info ?? '-';
  }

  saveState(): IChartState {
    const { chart } = this;

    if (!chart)
      return;

    return {
      showOHLV: this.showOHLV,
      showChanges: this.showChanges,
      showChartForm: this.showChartForm,
      enableOrderForm: this.enableOrderForm,
      link: this.link,
      showOrderConfirm: this.showOrderConfirm,
      showCancelConfirm: this.showCancelConfirm,
      instrument: chart.instrument,
      timeFrame: chart.timeFrame,
      stockChartXState: chart.saveState(),
      componentInstanceId: this.componentInstanceId,
      settings: this.settings,
    } as IChartState;
  }

  private _instrumentChangeHandler = (event) => {
    this._setUnavaliableIfNeed();
    this.instrument = event.value;
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
    if (state?.hasOwnProperty('showCancelConfirm'))
      this.showCancelConfirm = state?.showCancelConfirm;
    if (state?.hasOwnProperty('settings'))
      this.settings = state.settings;

    if (state?.hasOwnProperty('showChanges'))
      this.showChanges = state?.showChanges;
    if (state?.hasOwnProperty('showOHLV'))
      this.showOHLV = state?.showOHLV;
    this._setUnavaliableIfNeed();

    if (!chart) {
      return;
    }

    this._handleSettingsChange(this.settings);

    this.instrument = state?.instrument ?? {
      id: 'ESZ1.CME',
      symbol: 'ESZ1',
      exchange: 'CME',
      productCode: 'ES',
      tickSize: 0.25,
      precision: 2,
      company: this._getInstrumentCompany(),
    };

    this._orders.init();
    this._positions.init();

    this.checkIfTradingEnabled();

    chart.showInstrumentWatermark = false;

    //  this.instrument = this.chart.instrument;

    chart.on(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, this._instrumentChangeHandler);
    chart.on(StockChartX.ChartEvent.SHOW_WAITING_BAR, this._handleShowWaitingBar);
    chart.on(StockChartX.ChartEvent.HIDE_WAITING_BAR, this._handleHideWaitingBar);
    chart.on(StockChartX.PanelEvent.CONTEXT_MENU, this._handleContextMenu);
    chart.on(StockChartX.ChartEvent.INDICATOR_REMOVED, this._handleIndicatorRemoved);
    this._themesHandler.themeChange$
      .pipe(untilDestroyed(this))
      .subscribe(value => {
        chart.theme = getScxTheme(this.settings);
        chart.setNeedsUpdate();
      });

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
        }
        /* else if (StockChartX.Indicator.registeredIndicators.VOL) {
           chart.addIndicators(new StockChartX.Indicator.registeredIndicators.VOL());
         }*/

        this.enableOrderForm = state?.enableOrderForm;
        this.showChartForm = state?.showChartForm;
        this.checkIfTradingEnabled();
      });

    this._loadedChart$.next(chart);

    this.broadcastData(this.chartLink, chart);

    if (environment.isDev) {
      let charts = [];
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

  private _handleShowWaitingBar = (e) => {
    this.loading = true;
  }

  private _handleHideWaitingBar = (e) => {
    this.loading = false;
  }
  private _handleIndicatorRemoved = () => {
    setTimeout(() => {
      this.chart.setNeedsLayout();
      this.chart.setNeedsUpdate(true);
    });
  }

  private _handleContextMenu = (e) => {
    this.activeIndicator = this.chart.indicators.find(i => i.isActive);

    const event = e.value.event.evt.originalEvent;
    this.contextEvent = event;

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
      useWaitingBar: false,
      autoLoad: false,
      showInstrumentWatermark: false,
      incomePrecision: state?.instrument?.precision ?? 2,
      stayInDrawingMode: false,
      datafeed: this.datafeed,
      timeFrame: (state && state.timeFrame)
        ?? { interval: 1, periodicity: StockChartXPeriodicity.HOUR },
      theme: getScxTheme(),
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

  handleNodeEvent(name: LayoutNodeEvent, data) {
    switch (name) {
      case LayoutNodeEvent.Close:
      case LayoutNodeEvent.Destroy:
      case LayoutNodeEvent.Hide:
        this._closeSettings();
        this.onWindowClose();
        break;
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
      case LayoutNodeEvent.MakeVisible:
        this.chart?.handleResize();
        this.setNeedUpdate();
        this.toolbar?.updateOffset();
        break;
      case LayoutNodeEvent.Move:
        this.toolbar.updateOffset();
        break;
      case LayoutNodeEvent.Event:
        return this._handleKey(data);
    }
  }

  private _handleKey(event) {
    if (!(event instanceof KeyboardEvent)) {
      return false;
    }
    this.keysStack.handle(event);
    this.toolbar.items.forEach(item => {
      const hotkey = item.settings.general?.drawVPC;
      if (hotkey) {
        const keyBinding = KeyBinding.fromDTO(hotkey);
        if (this.keysStack.equals(keyBinding))
          this.createCustomVolumeProfile(item);
      }
    });
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
    this.settings = state?.settings || clone(defaultChartSettings);
    this.link = state?.link ?? Math.random();
    this._loadedState$.next(state);
    if (state?.account) {
      this.account = state.account;
    }
    if (state?.componentInstanceId) {
      this.componentInstanceId = state.componentInstanceId;
    }

    this.addLinkObserver({
      link: this._getSettingsKey(),
      layoutContainer: this.layoutContainer,
      handleLinkData: this._handleSettingsChange.bind(this),
    });
    this.addLinkObserver({
      link: this._getCustomVolumeProfileKey(),
      layoutContainer: this.layoutContainer,
      handleLinkData: this._handleCustomVolumeProfileSettingsChange.bind(this),
    });
  }

  loadTemplate(template: IChartTemplate): void {
    this.loadedTemplate = template;
    this.loadState(template.state);
  }

  loadCustomeVolumeTemplate(template: IVolumeTemplate): void {
    this.loadedCustomeVolumeTemplate = template;

    this.createCustomVolumeProfile(template.settings);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy() {
    this._positions.destroy();
    this._orders.destroy();
    this._templatesSubscription?.unsubscribe();

    if (this.chart) {
      this.chart.off(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, this._instrumentChangeHandler);
      this.chart.off(StockChartX.PanelEvent.CONTEXT_MENU, this._handleContextMenu);
      this.chart.off(StockChartX.ChartEvent.SHOW_WAITING_BAR, this._handleShowWaitingBar);
      this.chart.off(StockChartX.ChartEvent.HIDE_WAITING_BAR, this._handleHideWaitingBar);
      this.chart.off(StockChartX.ChartEvent.INDICATOR_REMOVED, this._handleIndicatorRemoved);
      this.chart.destroy();
    }

    this.unsubscribe();
    this.chart = null;
  }

  onWindowClose() {
    const link = this.chartLink;
    this.layout.removeComponents((item) => {
      const isIndicatorComponent = [Components.Indicators, Components.IndicatorList].includes(item.type);
      return item.visible && isIndicatorComponent && (item.options.componentState()?.state?.link === link);
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
    this.secondOcoOrder = null;
    this.firstOcoOrder = null;
    this._orders.clearOcoOrders();
  }

  createOrderWithConfirm(config: Partial<IOrder>, event) {
    if (!this.isTradingEnabled)
      return;

    if (this.showOrderConfirm) {
      const dto = this._sideForm.getDto();
      const priceSpecs = getPriceSpecs(dto, config.price, this.instrument.tickSize);
      this.createConfirmModal({
        order: { ...dto, ...config, ...priceSpecs },
      }, event).afterClose
        .pipe(untilDestroyed(this))
        .subscribe((res) => {
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

  async cancelOrderWithConfirm(order: IOrder, event) {
    if (!this.showCancelConfirm)
      return Promise.resolve({ create: true, dontShowAgain: !this.showCancelConfirm });

    return this.createConfirmModal({
      order,
      prefix: 'Cancel'
    }, event).afterClose.toPromise();
  }

  private createConfirmModal(params, event) {
    return this._modalService.create({
      nzClassName: 'confirm-order',
      nzIconType: null,
      nzContent: ConfirmOrderComponent,
      nzFooter: null,
      nzNoAnimation: true,
      nzStyle: {
        left: `${event.evt.clientX}px`,
        top: `${event.evt.clientY}px`,
      },
      nzComponentParams: params
    });
  }

  createOrder(config: Partial<IOrder>) {
    if (!this.isTradingEnabled) {
      this._notifier.showError('You can\'t create order when trading is locked');
      return;
    }

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
      if (!this.firstOcoOrder) {
        this.firstOcoOrder = order;
        this._orders.createOcoOrder(order);
        this.ocoStep = this.ocoStep === OcoStep.None ? OcoStep.Fist : OcoStep.Second;
      } else if (!this.secondOcoOrder) {
        this.secondOcoOrder = order;
        this.ocoStep = this.ocoStep === OcoStep.None ? OcoStep.Fist : OcoStep.Second;
      }
      if (this.firstOcoOrder && this.secondOcoOrder) {
        this.firstOcoOrder.ocoOrder = this.secondOcoOrder;
        this._createOrder(this.firstOcoOrder);
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
    this.chart.setNeedsUpdate(true);
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
      this._templatesService.createItem(template).subscribe(
        (template) => {
          this.loadedTemplate = template;
        },
        error => this._notifier.showError(error, 'Failed to create Template'));
    });
  }

  private _handleCustomVolumeProfileSettingsChange(data: { template: IVolumeTemplate, identificator: any }) {
    if (data == null)
      return;

    if (data?.template?.id) {
      const indicators = this.chart.indicators.filter(i => i instanceof StockChartX.CustomVolumeProfile && i.templateId == data.template.id);
      for (const indicator of indicators) {
        indicator.settings = data.template.settings;
      }
    } else {
      const indicator = this.chart.indicators.find(i => i === data.identificator);

      if (indicator) {
        indicator.settings = data.template.settings;
      }
    }
  }

  private _handleSettingsChange(settings: IChartSettings) {
    this.settings = settings;
    const session = settings.session?.sessionTemplate;

    if (this.session?.id != session?.id) {
      this.datafeed.setSession(session, this.chart);
    }
    const { trading } = settings;
    const ordersEnabled = trading.trading.showWorkingOrders;
    this._orders.setVisibility(ordersEnabled);
    this.showOHLV = trading.trading.showOHLVInfo;
    this.showChanges = trading.trading.showInstrumentChange;
    const oldTheme = this.chart.theme;
    const theme = getScxTheme(settings);
    this._sideForm.loadState({ settings: mapSettingsToSideFormState(settings) });

    this.chart.theme = theme;
    let needAutoScale = false;

    if (oldTheme.tradingPanel.tradingBarLength != theme.tradingPanel.tradingBarLength ||
      theme.tradingPanel.tradingBarUnit != oldTheme.tradingPanel.tradingBarUnit) {
      needAutoScale = true;
      this.chart.handleResize();
    }

    const pixelsPrice = settings?.valueScale?.valueScale.pixelsPrice ?? 0;
    const isAutomatic = settings?.valueScale?.valueScale?.isAutomatic;
    this.chart.setPixelsPrice(pixelsPrice);

    switch (isAutomatic) {
      case IsAutomaticPixelPrice.AUTOMATIC:
        this.chart.setPixelsPrice(0);
        setTimeout(() => {
          this.chart.setNeedsUpdate(true);
        });
        break;
      case IsAutomaticPixelPrice.PIXELS_PRICE:
        this.chart.setPixelsPrice(pixelsPrice);
        break;
      default:
        break;
    }

    if (!this.settings.valueScale) {
      this.settings.valueScale = { valueScale: { pixelsPrice: 0, isAutomatic: IsAutomaticPixelPrice.AUTOMATIC } };
    }
    this.settings.valueScale.valueScale.pixelsPrice = this.chart.getPixelsPrice() ?? 0;

    this.chart.setNeedsUpdate(needAutoScale);
  }

  private _getSettingsKey() {
    return `${this.componentInstanceId}.${chartSettings}`;
  }

  private _getCustomVolumeProfileKey() {
    return `${this._getSettingsKey()}.cvp`;
  }

  openSettingsDialog(): void {
    const linkKey = this._getSettingsKey();
    const widget = this.layout.findComponent((item: IWindow) => {
      return item.type === Components.ChartSettings && (item.component as any).linkKey === linkKey;
    });

    if (widget)
      widget.focus();
    else {
      const coords: any = {};
      if (this.contextEvent) {
        coords.x = this.contextEvent.screenX;
        coords.y = this.contextEvent.screenY;
      }
      this.layout.addComponent({
        component: {
          name: chartSettings,
          state: {
            linkKey,
            settings: this.settings,
          }
        },
        closeBtn: true,
        single: false,
        width: 618,
        height: 475,
        ...coords,
        allowPopup: false,
        closableIfPopup: true,
        resizable: false,
        removeIfExists: false,
        minimizable: false,
        maximizable: false,
      });
    }
  }

  openVolumeSettingsDialog() {
    if (!this.activeIndicator)
      return;

    const linkKey = this._getCustomVolumeProfileKey();
    const widget = this.layout.findComponent((item: IWindow) => {
      return item.type === Components.ChartVolumeSettings && (item.component as any).linkKey === linkKey;
    });
    if (widget) {
      widget.focus();
      console.log('w', widget);
    } else {
      const coords: any = {};
      if (this.contextEvent) {
        coords.x = this.contextEvent.screenX;
        coords.y = this.contextEvent.screenY;
      }
      this.layout.addComponent({
        component: {
          name: customVolumeProfileSettings,
          state: {
            linkKey,
            identificator: this.activeIndicator,
            template: {
              id: this.activeIndicator.templateId,
              settings: this.activeIndicator?.settings,
            },
          }
        },
        closeBtn: true,
        single: false,
        width: 618,
        height: 475,
        ...coords,
        allowPopup: false,
        closableIfPopup: true,
        resizable: false,
        removeIfExists: false,
        minimizable: false,
        maximizable: false,
      });
    }
  }

  private _closeSettings() {
    this.layout.removeComponents((item) => {
      const isSettingsComponent = Components.ChartSettings === item.type;
      return item.visible && isSettingsComponent && (item.options.componentState()?.state?.linkKey === this._getSettingsKey());
    });
  }

  updateInSettings() {
    this.settings.trading.trading.showOHLVInfo = this.showOHLV;
    this.settings.trading.trading.showInstrumentChange = this.showChanges;
    this.broadcastData(chartReceiveKey + this._getSettingsKey(), this.settings);
  }

  saveCustomVolume(): void {
    if (!this.loadedCustomeVolumeTemplate)
      return;

    const template: IVolumeTemplate = {
      id: this.loadedCustomeVolumeTemplate.id,
      name: this.loadedCustomeVolumeTemplate.name,
      settings: this.activeIndicator?.settings
    };

    this._volumeProfileTemplatesRepository.updateItem(template).subscribe(() => {
      this.loadedCustomeVolumeTemplate = template;
    }, error => this._notifier.showError(error, 'Failed to save Template'));
  }

  saveAsCustomVolume(): void {
    const modal = this._modalService.create({
      nzTitle: 'Save as',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWidth: 438,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        label: 'Template name',
      },
    });

    modal.afterClose.subscribe(result => {
      if (!result)
        return;

      const template: IVolumeTemplate = {
        id: Date.now().toString(),
        name: result,
        settings: this.activeIndicator?.settings,
      };
      this._volumeProfileTemplatesRepository.createItem(template).subscribe((template) => {
        this.loadedCustomeVolumeTemplate = template;
      }, error => this._notifier.showError(error, 'Failed to create Template'));
    });
  }

  editCustomProfile(template: IVolumeTemplate): void {
    const modal = this._modalService.create({
      nzTitle: 'Edit name',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWidth: 438,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        label: 'Template name',
      },
    });

    modal.afterClose.subscribe(name => {
      if (!name)
        return;

      this._volumeProfileTemplatesRepository.updateItem({ ...template, name }).subscribe();
    });
  }

  deleteVolumeProfile(template: IVolumeTemplate): void {
    const modal = this._modalService.create({
      nzContent: ConfirmModalComponent,
      nzWrapClassName: 'vertical-center-modal',
      nzComponentParams: {
        message: 'Do you want delete the template?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result.confirmed) {
        this._volumeProfileTemplatesRepository.deleteItem(+template.id).subscribe();
      }
    });
  }

  private _loadTemplateList(): void {
    // this._volumeProfileTemplatesRepository.subscribe((data) => {
    //   this.customeVolumeTemplate = data?.items || [];
    // });
  }

  private _subscribeToHotKey(): void {

  }
}

function setCandleBackground(barTheme, settings: IChartSettings) {
  if (barTheme.upCandle.fill) {
    barTheme.upCandle.fill.fillColor = settings.general.upCandleColor;
  } else {
    barTheme.upCandle.border.strokeColor = settings.general.upCandleColor;

  }
  if (barTheme.downCandle.fill) {
    barTheme.downCandle.fill.fillColor = settings.general.downCandleColor;
  } else {
    barTheme.downCandle.border.strokeColor = settings.general.downCandleColor;
  }
}

function setBarBackground(barTheme, settings) {
  barTheme.upBar.strokeColor = settings.general.upCandleColor;
  barTheme.downBar.strokeColor = settings.general.downCandleColor;
}


function setWickColor(barTheme, settings: IChartSettings) {
  barTheme.upCandle.wick.strokeColor = settings.general.wickColor;
  barTheme.downCandle.wick.strokeColor = settings.general.wickColor;
}

function getScxTheme(settings: IChartSettings = defaultChartSettings) {
  const theme = clone(StockChartX.Theme.Dark);

  theme.plot.line.simple.strokeColor = settings.general.lineColor;
  theme.plot.bar.OHLC.strokeColor = settings.general.lineColor;
  theme.plot.line.mountain.line.strokeColor = settings.general.lineColor;
  theme.chart.background = [settings.general.gradient1, settings.general.gradient2];


  setCandleBackground(theme.plot.bar.candle, settings);
  setCandleBackground(theme.plot.bar.candleVolume, settings);
  setCandleBackground(theme.plot.bar.hollowCandle, settings);
  theme.plot.bar.hollowCandle.downHollowCandle.border.strokeColor = settings.general.downCandleColor;
  theme.plot.bar.hollowCandle.upHollowCandle.border.strokeColor = settings.general.upCandleColor;
  theme.plot.bar.hollowCandle.downHollowCandle.wick.strokeColor = settings.general.downCandleColor;
  theme.plot.bar.hollowCandle.upHollowCandle.wick.strokeColor = settings.general.upCandleColor;

  setCandleBackground(theme.plot.bar.renko, settings);
  setCandleBackground(theme.plot.bar.lineBreak, settings);
  setCandleBackground(theme.plot.bar.kagi, settings);
  setCandleBackground(theme.plot.bar.equiVolume, settings);
  setCandleBackground(theme.plot.bar.equiVolumeShadow, settings);
  setBarBackground(theme.plot.bar.coloredHL, settings);
  setCandleBackground(theme.plot.bar.heikinAshi, settings);
  setCandleBackground(theme.plot.bar.pointAndFigure, settings);


  setBorderColor(theme.plot.bar.candle, settings);
  setBorderColor(theme.plot.bar.candleVolume, settings);
  setBorderColor(theme.plot.bar.equiVolume, settings);
  setBorderColor(theme.plot.bar.equiVolumeShadow, settings);
  setBorderColor(theme.plot.bar.heikinAshi, settings);
  setBorderColor(theme.plot.bar.hollowCandle, settings);
  setBorderColor(theme.plot.bar.lineBreak, settings);

  setWickColor(theme.plot.bar.candle, settings);
  setWickColor(theme.plot.bar.candleVolume, settings);
  setWickColor(theme.plot.bar.hollowCandle, settings);

  theme.valueScale.text.fontFamily = settings.general.font.fontFamily;
  theme.valueScale.text.fillColor = settings.general.font.textColor;
  theme.valueScale.text.fontSize = settings.general.font.fontSize;

  theme.dateScale.text.fontFamily = settings.general.font.fontFamily;
  theme.dateScale.text.fillColor = settings.general.font.textColor;
  theme.dateScale.text.fontSize = settings.general.font.fontSize;

  theme.valueScale.fill.fillColor = settings.general.valueScaleColor;
  theme.dateScale.fill.fillColor = settings.general.dateScaleColor;
  theme.chartPanel.grid.strokeColor = settings.general.gridColor;

  theme.orderBar = settings.trading.ordersColors;
  theme.orderBar.orderBarLength = settings.trading.trading.orderBarLength;
  theme.orderBar.orderBarUnit = settings.trading.trading.orderBarUnit;

  theme.tradingPanel.tradingBarLength = settings.trading.trading.tradingBarLength;
  theme.tradingPanel.tradingBarUnit = settings.trading.trading.tradingBarUnit;

  return theme;
}

function setBorderColor(barTheme, settings) {
  barTheme.upCandle.border.strokeColor = settings.general.upCandleBorderColor;
  barTheme.downCandle.border.strokeColor = settings.general.downCandleBorderColor;
  barTheme.upCandle.border.strokeEnabled = settings.general.upCandleBorderColorEnabled;
  barTheme.downCandle.border.strokeEnabled = settings.general.downCandleBorderColorEnabled;
}

function mapSettingsToSideFormState(settings) {
  const orderAreaSettings = settings.trading.orderArea.settings;
  const sideOrderSettings: any = {};
  sideOrderSettings.buyButtonsBackgroundColor = orderAreaSettings.buyMarketButton.background;
  sideOrderSettings.buyButtonsFontColor = orderAreaSettings.buyMarketButton.font;

  sideOrderSettings.sellButtonsBackgroundColor = orderAreaSettings.sellMarketButton.background;
  sideOrderSettings.sellButtonsFontColor = orderAreaSettings.sellMarketButton.font;

  sideOrderSettings.flatButtonsBackgroundColor = orderAreaSettings.flatten.background;
  sideOrderSettings.flatButtonsFontColor = orderAreaSettings.flatten.font;

  sideOrderSettings.cancelButtonBackgroundColor = orderAreaSettings.cancelButton.background;
  sideOrderSettings.cancelButtonFontColor = orderAreaSettings.cancelButton.font;

  sideOrderSettings.closePositionFontColor = orderAreaSettings.closePositionButton.font;
  sideOrderSettings.closePositionBackgroundColor = orderAreaSettings.closePositionButton.background;

  sideOrderSettings.icebergFontColor = orderAreaSettings.icebergButton.font;
  sideOrderSettings.icebergBackgroundColor = orderAreaSettings.icebergButton.background;

  sideOrderSettings.formSettings = {};
  sideOrderSettings.formSettings.showIcebergButton = orderAreaSettings.icebergButton.enabled;
  sideOrderSettings.formSettings.showFlattenButton = orderAreaSettings.flatten.enabled;
  sideOrderSettings.formSettings.closePositionButton = orderAreaSettings.closePositionButton.enabled;
  sideOrderSettings.formSettings.showCancelButton = orderAreaSettings.cancelButton.enabled;
  sideOrderSettings.formSettings.showBuyButton = orderAreaSettings.buyMarketButton.enabled;
  sideOrderSettings.formSettings.showSellButton = orderAreaSettings.sellMarketButton.enabled;
  sideOrderSettings.formSettings.showBracket = settings.trading.trading.bracketButton;

  sideOrderSettings.tif = settings.trading.tif;

  return sideOrderSettings;
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
