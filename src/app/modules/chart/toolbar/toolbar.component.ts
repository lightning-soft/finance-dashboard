import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InstrumentsRepository, IInstrument } from 'trading'; //Error
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
        'Dot', 'Square', 'Diamond', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Arrow', 'Note'
      ]
    },
    {
      value: 'Geometric',
      items: ['LineSegment', 'HorizontalLine', 'VerticalLine',
        'Rectangle', 'Triangle', 'Circle', 'Ellipse', 'Polygon', 'Polyline', 'Freehand', 'CyclicLines']
    },
    {
      value: 'Fibonacci',
      items: ['FibonacciArcs', 'FibonacciEllipses',
        'fibonacciRetracements', 'FibonacciFan', 'FibonacciTimeZone', 'FibonacciExtensions']
    },
    {
      value: 'Trend Channel Drawings',
      items: ['TrendChannel', 'AndrewPitchfork',
        'ErrorChannel', 'RaffRegression', 'QuadrantLines',
        'TironeLevels', 'SpeedLines', 'GannFan', 'TrendAngle']
    },
    {
      value: 'General Drawings', items: [
        'Text', 'Image', 'Balloon', 'Measure'
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
    if (newSymbol !== chart.instrument.symbol) {

      setTimeout(() => {
        chart.instrument = {
          ...instrument,
          id: instrument.id as any,
          symbol: instrument.name,
          company: '',
          exchange: '',
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
  };


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


  constructor(private _instrumentsRepository: InstrumentsRepository) {
  }

  _search(search?: string) {
    this._instrumentsRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(
        (res) => {
          if (search != null) {
            const items = res.data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

            this.instruments = items.slice(0, 100);
          } else
            this.instruments = []; // todo fix this
        },
        (e) => console.error('error', e),
      );
  }

  ngOnInit(): void {
    this._search();
  }

  getTimeFrame(timeFrame: ITimeFrame): string {
    return timeFrame.interval +
      timeFrame.periodicity;
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
    let drawing = StockChartX.Drawing.deserialize({ className: getDrawingClassName(name) });
    chart.startUserDrawing(drawing);
  }

  removeDrawing() {
    this.chart.removeDrawings();
    this.chart.setNeedsUpdate(true);
  }

  makeSnapshot() {
    this.chart.saveImage();
  }
}

function getDrawingClassName(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
