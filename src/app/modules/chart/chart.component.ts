import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { LayoutService } from 'layout';
import { LazyLoadingService } from 'lazy-assets';
import { BehaviorSubject } from 'rxjs';
import { CSVDatafeed } from './datafeed/CsvDatafeed';
import { Datafeed } from './datafeed/Datafeed';
import { IChart } from './models/chart';
import { IChartConfig } from './models/chart.config';
import { IScxComponentState } from './models/scx.component.state';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'src/environments/environment';

declare let StockChartX: any;
declare let $: JQueryStatic;

const EVENTS_SUFFIX = '.scxComponent';

@UntilDestroy()
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  providers: [
    { provide: Datafeed, useClass: CSVDatafeed }
  ]
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  loading: boolean;


  @HostBinding('class.chart-unavailable') isChartUnavailable: boolean;
  @ViewChild('chartContainer')
  chartContainer: ElementRef;
  chart: IChart;

  private loadedState = new BehaviorSubject<IScxComponentState>(null);

  constructor(
    protected _lazyLoaderService: LazyLoadingService,
    protected _elementRef: ElementRef,
    protected datafeed: Datafeed,
    private layoutService: LayoutService
  ) {
  }

  protected loadFiles(): Promise<any> {
    return this._lazyLoaderService.loadScx();
  }

  async ngAfterViewInit() {
    this.loadFiles()
      .then(() => this.loadChart())
      .catch(e => console.log(e));


    this.layoutService.onStateChange$.pipe(
      untilDestroyed(this)
    ).subscribe(() => {
      this.handleResize();
    });
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
    const { _elementRef, loadedState } = this,
      state = loadedState && loadedState.value,
      chart = this.chart = this._initChart(state);

    if (this.datafeed instanceof CSVDatafeed)
      this.datafeed.loadInstruments()
        .pipe(
          untilDestroyed(this)
        )
        .subscribe();

    this._setUnavaliableIfNeed();

    if (!chart) {
      return;
    }

    chart.on(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, (event) => {
      this._setUnavaliableIfNeed();
      this.chart.instrument = event.value;

    });


    this.loadedState
      .pipe(
        untilDestroyed(this)
      ).subscribe(value => {
        if (!value) {
          return;
        }

        // if (value.instrument && value.instrument.id != null) {
        // }

        // if (value.timeFrame != null) {
        //   chart.timeFrame = value.timeFrame;
        // }

        // if (value.stockChartXState) {
        //   chart.loadState(value.stockChartXState);
        // } else if (StockChartX.Indicator.registeredIndicators.VOL) {
        //   chart.addIndicators(new StockChartX.Indicator.registeredIndicators.VOL());
        // }
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

    return new StockChartX.Chart({
      container: $(chartContainer.nativeElement),
      datafeed: this.datafeed,
      showToolbar: false,
      showScrollbar: false,
      allowReadMoreHistory: true,
      autoSave: false,
      autoLoad: false,
      timeFrame: state && state.timeFrame,
      instrument: (state && state.instrument) || {
        symbol: 'AAPL',
        tickSize: 0.01,
        id: 'AAPL',
      }
    } as IChartConfig);
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

  @HostBinding('window:resize')
  handleResize() {
    this.setNeedUpdate();
  }

  loadState(state?) {
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

