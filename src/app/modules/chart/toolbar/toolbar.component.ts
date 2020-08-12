import {Component, Input, OnInit} from '@angular/core';
import {InstrumentsRepository} from '../../communication/trading/repositories';
import {Observable} from 'rxjs';
import {IInstrument} from '../../communication/trading/models';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {IChart} from '../models/chart';
import {ITimeFrame, StockChartXPeriodicity} from '../datafeed/TimeFrame';


@UntilDestroy()
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  instrument = 'AAPL';


  timeFrameOptions = [
    {interval: 1, periodicity: StockChartXPeriodicity.YEAR},
    {interval: 6, periodicity: StockChartXPeriodicity.MONTH},
    {interval: 3, periodicity: StockChartXPeriodicity.MONTH},
    {interval: 1, periodicity: StockChartXPeriodicity.MONTH},
    {interval: 1, periodicity: StockChartXPeriodicity.WEEK},
    {interval: 1, periodicity: StockChartXPeriodicity.DAY},
    {interval: 4, periodicity: StockChartXPeriodicity.HOUR},
    {interval: 1, periodicity: StockChartXPeriodicity.HOUR},
    {interval: 1, periodicity: StockChartXPeriodicity.MINUTE}
  ] as ITimeFrame[];

  iconCrosses = ['dot', 'none', 'markers', 'crossBars'];


  priceStyles = ['heikinAshi', 'bar', 'candle',
    'hollowCandle', 'renko', 'lineBreak', 'kagi',
    'candleVolume', 'equiVolume', 'equiVolumeShadow',
    'line', 'mountain', 'pointAndFigure'];

  zoomOptions = ['Zoom Date Range', 'Zoom Rect'];

  drawingInstruments = [
    {
      value: 'Chart market',
      items: [
        'Dot', 'Square', 'Diamond', 'Arrow-Up', 'Arrow-Down', 'Arrow-Left', 'Arrow-Right', 'Arrow', 'Note'
      ]
    },
    {
      value: 'Geometric',
      items: ['Line-Segment', 'Horizontal-Line', 'Vertical-Line',
        'Rectangle', 'Triangle', 'Circle', 'Ellipse', 'Polygon', 'Polyline', 'Free-hand', 'Cyclic-Lines']
    },
    {
      value: 'Fibonacci',
      items: ['Fibonacci-Arcs', 'Fibonacci-Ellipsis',
        'Fibonacci-Rectangle', 'Fibonacci-Fan', 'Fibonacci-Time-Zone', 'Fibonacci-Extensions']
    },
    {
      value: 'Trend Channel Drawings',
      items: ['Trend-Channel', 'Andrew-Pitchfork',
        'Error-Channel', 'Raff-Regression', 'Quadrant-Lines',
        'Tirone-Levels', 'Speed-Lines', 'Gann-Fan', 'Trend-Angle']
    },
    {
      value: 'General Drawings', items: [
        'Text', 'Image', 'Balloon', 'Measure'
      ]
    }
  ];


  instuments$: Observable<IInstrument[]>;

  @Input() chart: IChart;

  timeFrame = this.timeFrameOptions[5];
  priceStyle = this.priceStyles[1];
  iconCross = this.iconCrosses[1];

  constructor(private _instrumentsRepository: InstrumentsRepository,
  ) {
    this.instuments$ = _instrumentsRepository.getItems()
      .pipe(
        untilDestroyed(this)
      );
  }

  ngOnInit(): void {

  }

  getTimeFrame(timeFrame: ITimeFrame): string {
    return timeFrame.interval +
      timeFrame.periodicity;
  }
}
