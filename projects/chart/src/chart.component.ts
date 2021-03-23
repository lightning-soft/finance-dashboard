import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
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
import { NzContextMenuService, NzDropdownMenuComponent } from "ng-zorro-antd";

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

  showOHLC = false;
  showChanges = false;
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
    this.chart.instrument = value;
    if (value) {
      value.company = this._getInstrumentCompany();
    }
    this.refresh();
  }

  private loadedState = new BehaviorSubject<IScxComponentState &
    { showOHLC: boolean, showChanges: boolean }>(null);

  enableOrderForm = false;
  showOrderForm = true;

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
    protected _loadingService: LoadingService,
    protected _accountsManager: AccountsManager
  ) {
    this.setTabIcon('icon-widget-chart');
    this.setNavbarTitleGetter(this._getNavbarTitle.bind(this));

    this._orders = new Orders(this);
    this._positions = new Positions(this);
  }

  protected loadFiles(): Promise<any> {
    return this._lazyLoaderService.load();
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
      link: this.link,
      instrument: chart.instrument,
      timeFrame: chart.timeFrame,
      stockChartXState: chart.saveState()
    };
  }

  contextMenu($event: MouseEvent) {
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
    this._setUnavaliableIfNeed();

    if (!chart) {
      return;
    }

    this._orders.init();
    this._positions.init();

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
      stayInDrawingMode: false,
      timeFrame: (state && state.timeFrame)
        ?? { interval: 1, periodicity: StockChartXPeriodicity.HOUR },
      instrument: (state && state.instrument) ?? {
        id: 'ESM1',
        symbol: 'ESM1',
        exchange: 'CME',
        tickSize: 0.25,
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
        this.setNeedUpdate();
        this.toolbar.update();
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
        name += ` - ${ this.instrument.description }`;
      }
      name += `, ${ timeFrame.interval }${ transformPeriodicity(timeFrame.periodicity) }`;

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
      this.chart.off(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, this._instrumentChangeHandler);
      this.chart.off(StockChartX.PanelEvent.CONTEXT_MENU, this._handleContextMenu);
      this.chart.destroy();
    }

    this.chart = null;
  }

  onWindowClose() {
    this.layout.removeComponent(Components.Indicators);
    this.layout.removeComponent(Components.IndicatorList);
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
