import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
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
  chart: IChart;

  get instrument() {
    return this.chart?.instrument;
  }

  private loadedState = new BehaviorSubject<IScxComponentState>(null);

  enableOrderForm = false;
  showOrderForm = true;

  constructor(
    protected _lazyLoaderService: LazyLoadingService,
    protected _themesHandler: ThemesHandler,
    protected _elementRef: ElementRef,
    protected datafeed: Datafeed,
  ) { }

  protected loadFiles(): Promise<any> {
    return this._lazyLoaderService.load();
  }

  async ngAfterViewInit() {
    this.loadFiles()
      .then(() => this.loadChart())
      .catch(e => console.log(e));
  }

  saveState() {
    const { chart } = this;

    if (!chart) {
      return;
    }

    return {
      instrument: chart.instrument,
      timeFrame: chart.timeFrame,
      stockChartXState: chart.saveState()
    };
  }

  loadChart() {
    const { loadedState } = this;
    const state = loadedState && loadedState.value;
    const chart = this.chart = this._initChart(state);

    this._setUnavaliableIfNeed();

    if (!chart) {
      return;
    }

    chart.on(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, (event) => {
      this._setUnavaliableIfNeed();
      this.chart.instrument = event.value;
      this.setTabTitle(event.value.symbol);

      this.broadcastLinkData({
        instrument: {
          id: event.value.symbol,
        },
      });
    });

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

    let charts = [];

    if (!environment.production) {
      if (!(window as any).charts) {
        (window as any).charts = [];
      }

      charts = (window as any).charts;
      charts.push(chart);
    }
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

    if (state && state.instrument) {
      this.setTabTitle(state.instrument.symbol);
    } else {
      this.setTabTitle('Chart');
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
      timeFrame: state && state.timeFrame,
      instrument: state && state.instrument,
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
  }

  handleNodeEvent(name: LayoutNodeEvent) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
        this.setNeedUpdate();
        break;
    }
  }

  handleLinkData(data: any) {
    this.update(data);
  }

  loadState(state?: any) {
    this.loadedState.next(state);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = null;
  }
}

function getScxTheme(theme: Themes) {
  return theme === Themes.Light ? StockChartX.Theme.Light : StockChartX.Theme.Dark;
}
