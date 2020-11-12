import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IInstrument } from 'trading';
import { ITimeFrame, StockChartXPeriodicity, TimeFrame } from '../datafeed/TimeFrame';
import { IChart } from '../models/chart';

declare const StockChartX;

const periodicityMap = new Map([
  ['t', 't'],
  ['s', 's'],
  ['', 'm'],
  ['h', 'h'],
  ['d', 'D'],
  ['m', 'M'],
  ['y', 'Y'],
  ['w', 'W'],
]);

@UntilDestroy()
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

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

  @Input() chart: IChart;

  get instrument(): IInstrument {
    return this.chart?.instrument;
  }

  set instrument(instrument: IInstrument) {
    const { chart } = this;

    if (!chart || !instrument || chart.instrument?.id === instrument.id)
      return;

    setTimeout(() => {
      chart.instrument = {
        ...instrument,
        company: '',
      };
      chart.sendBarsRequest();
    });
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

  getTimeFrame(timeFrame: ITimeFrame): string {
    const label = TimeFrame.periodicityToString(timeFrame.periodicity);

    return `${timeFrame.interval} ${label}`;
  }

  getShortTimeFrame(timeFrame: ITimeFrame): string {
    return `${timeFrame.interval} ${periodicityMap.get(timeFrame.periodicity)}`;
  }

  compareInstrumentDialog() {
    const { chart } = this;

    StockChartX.UI.ViewLoader.compareInstrumentDialog((dialog) => {
      dialog.show({
        chart,
        done: () => {
          if (chart) {
            chart.setNeedsUpdate();
          }
        }
      });
    });

  }

  openIndicatorDialog() {
    const { chart } = this;

    StockChartX.UI.ViewLoader.indicatorsDialog((dialog) => {
      dialog.show({
        chart,
        done: (className: string) => {
          const showSettingsDialog = StockChartX.UI.IndicatorsDialog.showSettingsBeforeAdding;

          if (!chart)
            return;

          const indicator = StockChartX.Indicator.deserialize({ className, chart });

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
    const chart = this.chart;
    chart.cancelUserDrawing();
    const drawing = StockChartX.Drawing.deserialize({ className: name });
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
