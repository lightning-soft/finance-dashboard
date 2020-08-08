import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { LazyLoadingService } from '../../../LazyLoadingService';
import { BehaviorSubject, Subject } from 'rxjs';
import { IChart } from './models/chart';
import { IScxComponentState } from './models/scx.component.state';
import { Datafeed } from './datafeed/Datafeed';
import { environment } from '../../../../environments/environment';
import { IChartConfig } from './models/chart.config';
import { CSVDatafeed } from './datafeed/CsvDatafeed';
import { LayoutService } from '../../../layout/layout.service';
import { takeUntil } from 'rxjs/operators';

declare let StockChartX: any;
declare let $: JQueryStatic;


const EVENTS_SUFFIX = '.scxComponent';

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
  _chart: IChart;

  private loadedState = new BehaviorSubject<IScxComponentState>(null);
  private destroy$ = new Subject<boolean>();

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
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.handleResize();
    });
  }

  saveState() {
    const { _chart } = this;

    if (!_chart) {
      return;
    }

    return {
      instrument: _chart.instrument,
      timeFrame: _chart.timeFrame,
      stockChartXState: _chart.saveState()
    };
  }

  loadChart() {
    const { _elementRef, loadedState } = this,
      state = loadedState && loadedState.value,
      chart = this._chart = this._initChart(state);

    if (this.datafeed instanceof CSVDatafeed)
      this.datafeed.loadInstruments()
    // .then(
    //   result => {
    //     if (result && result.length) {
    //       this._chart.instrument = result[0];
    //     }
    //   }
    // );

    this._setUnavaliableIfNeed();
    if (_elementRef && _elementRef.nativeElement) {
      chart.toolbar = $(_elementRef.nativeElement)
        .scx()
        .toolbar(chart);
    }

    if (!chart) {
      return;
    }

    chart.on(StockChartX.ChartEvent.INSTRUMENT_CHANGED + EVENTS_SUFFIX, (event) => {
      this._setUnavaliableIfNeed();
      this._chart.instrument = event.value;

    });


    this.loadedState.subscribe(value => {
      if (!value) {
        return;
      }

      if (value.instrument && value.instrument.id != null) {
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
    if (!this._chart) {
      return;
    }

    this.isChartUnavailable = this._chart.instrument && this._chart.instrument.id === null;
  }

  setNeedUpdate() {
    if (this._chart) {
      this._chart.setNeedsUpdate();
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
        tickSize: 0.01
      }
    } as IChartConfig);
  }

  refresh() {
    const { _chart } = this;

    if (!_chart) {
      return;
    }

    if (_chart.reload) {
      _chart.reload();
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
    if (this._chart) {
      this._chart.destroy();
    }

    this._chart = null;
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

