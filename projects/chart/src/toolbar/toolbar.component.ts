import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import { InstrumentsRepository, IInstrument } from 'trading';
import { ITimeFrame, StockChartXPeriodicity } from '../datafeed/TimeFrame';
import { IChart } from '../models/chart';

declare const StockChartX;

@UntilDestroy()
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  private _drawingClassName: Map<string, string> = new Map();

  private _searchSubscription: Subscription;

  showToolbar = true;

  timeFrameOptions = [
    { interval: 1, periodicity: StockChartXPeriodicity.YEAR },
    { interval: 6, periodicity: StockChartXPeriodicity.MONTH },
    { interval: 3, periodicity: StockChartXPeriodicity.MONTH },
    { interval: 1, periodicity: StockChartXPeriodicity.MONTH },
    { interval: 1, periodicity: StockChartXPeriodicity.WEEK },
    { interval: 1, periodicity: StockChartXPeriodicity.DAY },
    { interval: 4, periodicity: StockChartXPeriodicity.HOUR },
    { interval: 1, periodicity: StockChartXPeriodicity.HOUR },
    { interval: 1, periodicity: StockChartXPeriodicity.MINUTE }
  ] as ITimeFrame[];

  iconCrosses = ['dot', 'none', 'markers', 'crossBars'];

  priceStyles = ['heikinAshi', 'bar', 'candle',
    'hollowCandle', 'renko', 'lineBreak', 'kagi',
    'candleVolume', 'equiVolume', 'equiVolumeShadow',
    'line', 'mountain', 'pointAndFigure'];

  zoomOptions = ['dateRange', 'rect'];

  // allDraings = ["dot", "note", "square", "diamond", "arrowUp", "arrowDown", "arrowLeft", "arrowRight", "arrow", "lineSegment",
  //   "rectangle", "triangle", "circle", "ellipse", "horizontalLine", "verticalLine", "polygon", "polyline", "freeHand", "cyclicLines",
  //   "text", "image", "balloon", "measure", "measureTool", "fibonacciArcs", "fibonacciEllipses", "fibonacciRetracements", "fibonacciFan",
  //   "fibonacciTimeZones", "fibonacciExtensions", "andrewsPitchfork", "trendChannel", "errorChannel", "quadrantLines", "raffRegression",
  //   "tironeLevels", "speedLines", "gannFan", "trendAngle"];

  drawingInstruments = [
    {
      value: 'Chart market',
      items: [
        'dot', 'square', 'diamond', 'arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight', 'arrow', 'note'
      ]
    },
    {
      value: 'Geometric',
      items: [
        'lineSegment', 'horizontalLine', 'verticalLine',
        'rectangle', 'triangle', 'circle', 'ellipse', 'polygon', 'polyline', 'freeHand', 'cyclicLines'
      ]
    },
    {
      value: 'Fibonacci',
      items: [
        'fibonacciArcs', 'fibonacciEllipses',
        'fibonacciRetracements', 'fibonacciFan', 'fibonacciTimeZones', 'fibonacciExtensions'
      ]
    },
    {
      value: 'Trend Channel Drawings',
      items: [
        'trendChannel', 'andrewsPitchfork',
        'errorChannel', 'raffRegression', 'quadrantLines',
        'tironeLevels', 'speedLines', 'gannFan', 'trendAngle'
      ]
    },
    {
      value: 'General Drawings', items: [
        'text', 'image', 'balloon', 'measure'
      ]
    }
  ];

  instruments: IInstrument[] = [];

  @Input() chart: IChart;

  get instrument(): IInstrument {
    let instrument = this.chart?.instrument as any;

    if (instrument?.id != null)
      return instrument.symbol;
  }

  set instrument(instrument: IInstrument) {
    if (typeof instrument === 'string') {
      this._search(instrument);
      return;
    }

    let chart = this.chart;
    if (!chart || !instrument)
      return;


    let oldSymbol = chart.instrument && chart.instrument.symbol.toUpperCase();
    let newSymbol = instrument.name.toUpperCase();
    if (newSymbol !== chart.instrument?.symbol) {

      setTimeout(() => {
        chart.instrument = {
          ...instrument,
          id: instrument.id as any,
          symbol: instrument.name,
          company: '',
        };
        chart.sendBarsRequest();
      });
    }
  }

  get timeFrame() {
    return this.chart?.timeFrame;
  }

  set timeFrame(value) {
    const chart = this.chart;
    if (!chart)
      return;

    chart.timeFrame = value;
    chart.sendBarsRequest();
  }

  get priceStyle() {
    return this.chart?.priceStyleKind ?? 'candle';
  }

  set priceStyle(value) {
    this.chart.priceStyleKind = value;
    this.chart.setNeedsUpdate();
  }

  get iconCross(): string {
    return this.chart?.crossHairType ?? 'none';
  }

  set iconCross(value: string) {
    this.chart.crossHairType = value;
  }

  compareInstrument = (o1: any | string, o2: any) => {
    if (o1) {
      return typeof o1 === 'string' ? o1 === o2.id : o1.id === o2.id;
    } else {
      return false;
    }
  }


  compareTimeFrame = (obj1: ITimeFrame, obj2: ITimeFrame) => {
    if (!obj1 || !obj2)
      return;

    return obj2.interval === obj1.interval
      && obj2.periodicity === obj1.periodicity;
  }

  compareFun = (o1: any | string, o2: any) => {
    if (o1) {
      return typeof o1 === 'string' ? o1 === o2.label : o1.value === o2.value;
    } else {
      return false;
    }
  }


  constructor(private _instrumentsRepository: InstrumentsRepository) { }

  _search(criteria?: string) {
    this._searchSubscription?.unsubscribe();

    this._searchSubscription = this._instrumentsRepository.getItems({ criteria })
      .pipe(untilDestroyed(this))
      .subscribe(
        (res) => {
          this.instruments = res.data.slice(0, 100);
        },
        (e) => console.error('error', e),
      );
  }

  ngOnInit(): void {
    this._search();
  }

  getTimeFrame(timeFrame: ITimeFrame): string {
    return `${timeFrame.interval} ${timeFrame.periodicity}`;
  }

  compareInstrumentDialog() {
    StockChartX.UI.ViewLoader.compareInstrumentDialog((dialog) => {
      dialog.show({
        chart: this.chart,
        done: () => {
          let chart = this.chart;
          if (chart) {
            chart.setNeedsUpdate();
          }
        }
      });
    });

  }

  openIndicatorDialog() {
    StockChartX.UI.ViewLoader.indicatorsDialog((dialog) => {
      dialog.show({
        chart: this.chart,
        done: (className: string) => {
          let chart = this.chart,
            showSettingsDialog = StockChartX.UI.IndicatorsDialog.showSettingsBeforeAdding;

          if (!chart)
            return;

          let indicator = StockChartX.Indicator.deserialize({ className, chart });

          chart.addIndicators(indicator);
          if (showSettingsDialog) {
            indicator.showSettingsDialog();
          }
          chart.update();
        }
      });
    });
  }

  changePriceStyle(option) {
    this.chart.priceStyleKind = option;
    this.chart.setNeedsUpdate();
  }

  changeCursor(option) {
    this.chart.crossHairType = option;
  }

  zoom(option) {
    this.chart.startZoomIn(option);
  }

  addDrawing(name: string) {
    let chart = this.chart;
    chart.cancelUserDrawing();
    let drawing = StockChartX.Drawing.deserialize({ className: name });
    chart.startUserDrawing(drawing);
  }

  removeDrawing() {
    this.chart.removeDrawings();
    this.chart.setNeedsUpdate(true);
  }

  makeSnapshot() {
    this.chart.saveImage();
  }

  // private _mapDrawingInstruments(): void {
  //   this.drawingInstruments.forEach(instrument => {
  //     instrument.items.forEach(item => {
  //       this._drawingClassName.set(item, this._transformToClassName(item));
  //     });
  //   });
  // }

  public transformToUIName(str: string): string {
    const nameUI = str.replace(/[A-Z]/g, ' $&');
    return nameUI[0].toUpperCase() + nameUI.slice(1);
  }

  public transformToClassName(str: string): string {
    const className = str.replace(/[A-Z]/g, '-$&').toLowerCase();
    return className;
  }

}
