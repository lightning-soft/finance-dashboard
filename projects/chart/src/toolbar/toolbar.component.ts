import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  NgZone,
  Output,
  ViewChild,
  EventEmitter
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IInstrument } from 'trading';
import { ITimeFrame, StockChartXPeriodicity, TimeFrame } from '../datafeed/TimeFrame';
import { IChart } from '../models/chart';
import { NzDropdownMenuComponent, NzSelectComponent } from 'ng-zorro-antd';
import { Layout } from 'layout';
import { Components } from 'src/app/modules';

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
  @Input() link: any;
  @Input() enableOrderForm: boolean = false;
  @Output() enableOrderFormChange = new EventEmitter<boolean>();
  @ViewChild('menu2') menu: NzDropdownMenuComponent;

  zoomDropdownVisible = false;
  crossOpen = false;
  priceOpen = false;
  frameOpen = false;

  showToolbar = true;
  isDrawingsPinned = false;
  lastUsedDrawings = [];


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


  priceStyles = ['heikinAshi', 'bar', 'coloredHLBar', 'candle',
    'hollowCandle', 'renko', 'lineBreak', 'kagi',
    'candleVolume', 'equiVolume', 'equiVolumeShadow',
    'line', 'mountain', 'pointAndFigure'];

  priceStyleNames = {
    heikinAshi: 'Heikin Ashi',
    bar: 'Bars',
    coloredHLBar: 'Colored Bars',
    candle: 'Candle',
    hollowCandle: 'Hollow Candle',
    renko: 'Renko',
    lineBreak: 'Line Break',
    kagi: 'Kagi',
    candleVolume: 'Candle Volume',
    equiVolume: 'Equi Volume',
    equiVolumeShadow: 'Equi Volume Shadow',
    line: 'Line',
    mountain: 'Mountain',
    pointAndFigure: 'Point And Figure'
  };

  zoomOptions = ['dateRange', 'rect'];

  zoomNames = {
    dateRange: 'Zoom Date Range',
    rect: 'Zoom Rect'
  };

  iconCrosses = ['dot', 'none', 'markers', 'crossBars'];

  cursorNames = {
    none: 'Arrow',
    dot: 'Dot',
    markers: 'Arrow with Markers',
    crossBars: 'Crosshairs',
  };
  shouldDrawingBeOpened = false;

  get isDrawingsVisible() {
    return this.isDrawingsPinned || this.shouldDrawingBeOpened;
  }


  // allDrawings = ["dot", "note", "square", "diamond", "arrowUp", "arrowDown", "arrowLeft", "arrowRight", "arrow", "lineSegment",
  //   "rectangle", "triangle", "circle", "ellipse", "horizontalLine", "verticalLine", "polygon", "polyline", "freeHand", "cyclicLines",
  //   "text", "image", "balloon", "measure", "measureTool", "fibonacciArcs", "fibonacciEllipses", "fibonacciRetracements", "fibonacciFan",
  //   "fibonacciTimeZones", "fibonacciExtensions", "andrewsPitchfork", "trendChannel", "errorChannel", "quadrantLines", "raffRegression",
  //   "tironeLevels", "speedLines", "gannFan", "trendAngle"];

  drawingInstruments = [
    {
      icon: 'text',
      name: 'General-drawings',
      items: ['text']
    },
    {
      icon: 'measure',
      name: 'Measure',
      items: ['measures']
    },
    {
      icon: 'add-image',
      name: 'Image',
      items: ['image']
    },
    {
      icon: 'chart-market',
      name: 'Chart market',
      items: [
        'dot', 'square', 'diamond', 'arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight', 'arrow', 'note'
      ]
    },
    {
      icon: 'fibonacci',
      name: 'Fibonacci',
      items: [
        'fibonacciArcs', 'fibonacciEllipses',
        'fibonacciRetracements', 'fibonacciFan', 'fibonacciTimeZones', 'fibonacciExtensions'
      ]
    },
    {
      icon: 'geometric',
      name: 'Geometric',
      items: [
        'lineSegment', 'horizontalLine', 'verticalLine',
        'rectangle', 'triangle', 'circle', 'ellipse', 'polygon', 'polyline', 'freeHand', 'cyclicLines'
      ]
    },
    {
      icon: 'trend-channel-drawing',
      name: 'Trend Channel Drawings',
      items: [
        'trendChannel', 'andrewsPitchfork',
        'errorChannel', 'raffRegression', 'quadrantLines',
        'tironeLevels', 'speedLines', 'gannFan', 'trendAngle'
      ]
    },


    // {
    //   icon: 'drawing-baloon',
    //   name: 'General-drawings',
    //   items: ['balloon']
    // },

  ];

  @Input() chart: IChart;
  @Input() layout: Layout;

  @HostBinding('class.opened')
  get isOpened() {
    return this.priceOpen || this.crossOpen ||
      this.frameOpen || this.zoomDropdownVisible;
  }

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

  update() {
    this.isDrawingsPinned = false;
  }

  toggleDrawingVisible() {
    this.shouldDrawingBeOpened = !this.shouldDrawingBeOpened;
  }

  hasOneDrawing(drawingInstrument: any) {
    return drawingInstrument.items.length === 1;
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
    this.layout.addComponent({
      component: {
        name: Components.Indicators,
        state: {
          link: this.link,
          chart: this.chart,
        },
      },
      width: 600,
      resizable: false,
      maximizable: false,
      allowPopup: false,
      closableIfPopup: true,
      minimizable: false,
      single: true,
      removeIfExists: true,
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
    this.addLastUsedDrawing(name);
  }

  addLastUsedDrawing(name: string) {
    if (!this.lastUsedDrawings.includes(name)) {
      this.lastUsedDrawings = [name, ...this.lastUsedDrawings].slice(0, 3);
    }
  }

  removeDrawing() {
    this.chart.removeDrawings();
    this.chart.setNeedsUpdate(true);
  }

  stayInDragMode() {
    this.chart.stayInDrawingMode = !this.chart.stayInDrawingMode;
    this.chart.setNeedsUpdate(true);
  }

  visible() {
    this.chart.showDrawings = !this.chart.showDrawings;
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

  toggleForm() {
    this.enableOrderForm = !this.enableOrderForm;
    this.enableOrderFormChange.emit(this.enableOrderForm);
  }
}
