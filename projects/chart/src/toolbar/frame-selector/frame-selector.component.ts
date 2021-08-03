import { Component, Input } from '@angular/core';
import { IChart, ITimeFrame, StockChartXPeriodicity, TimeFrame } from '../../models';
import { NotifierService } from 'notifier';

@Component({
  selector: 'frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.scss']
})
export class FrameSelectorComponent {
  timeInterval = 1;
  timePeriodicity = StockChartXPeriodicity.HOUR;

  peridInterval = 3;
  periodPeriodicity = StockChartXPeriodicity.WEEK;

  isLeaving = false;


  @Input() chart: IChart;


  get timeFrame() {
    return this.chart?.timeFrame;
  }

  set timeFrame(value) {
    const chart = this.chart;
    if (!chart)
      return;
    chart.timeFrame = value;
    this.updateChartBars();
  }


  set barCount(count: number) {
    if (!this.chart)
      return;
    this.chart.sendBarsRequest();
  }

  private _timePeriod: ITimeFrame = { periodicity: StockChartXPeriodicity.WEEK, interval: 3 };

  get timePeriod() {
    return this._timePeriod;
  }

  set timePeriod(value) {
    this._timePeriod = value;
    this.updateChartBars();
  }

  customPeriodOptions = [StockChartXPeriodicity.DAY,
    StockChartXPeriodicity.WEEK, StockChartXPeriodicity.MONTH,
    StockChartXPeriodicity.YEAR];

  customIntervalOptions = [
    StockChartXPeriodicity.SECOND,
    StockChartXPeriodicity.MINUTE,
    StockChartXPeriodicity.HOUR,
    ...this.customPeriodOptions,
    StockChartXPeriodicity.TICK,
    StockChartXPeriodicity.VOLUME,
    StockChartXPeriodicity.REVS,
    StockChartXPeriodicity.RENKO,
    StockChartXPeriodicity.RANGE,
  ];

  intervalOptions = [
    {
      active: false,
      period: 'AMS REVS Bar',
      periodicities: [StockChartXPeriodicity.REVS],
      timeFrames: [{
        interval: 4, periodicity: StockChartXPeriodicity.REVS,
      },
        { interval: 8, periodicity: StockChartXPeriodicity.REVS },
        { interval: 12, periodicity: StockChartXPeriodicity.REVS },
        { interval: 16, periodicity: StockChartXPeriodicity.REVS },
      ]
    },
    {
      active: false,
      period: 'Seconds',
      periodicities: [StockChartXPeriodicity.SECOND],
      timeFrames: [
    /*    {
          interval: 1, periodicity: StockChartXPeriodicity.SECOND,
        },
        { interval: 5, periodicity: StockChartXPeriodicity.SECOND },
        { interval: 15, periodicity: StockChartXPeriodicity.SECOND },*/
        { interval: 30, periodicity: StockChartXPeriodicity.SECOND },
        { interval: 40, periodicity: StockChartXPeriodicity.SECOND },
      ]
    },
    {
      active: false,
      period: 'Minutes',
      periodicities: [StockChartXPeriodicity.MINUTE],
      timeFrames: [
        {
          interval: 1, periodicity: StockChartXPeriodicity.MINUTE,
        },
        {
          interval: 3, periodicity: StockChartXPeriodicity.MINUTE,
        },
        {
          interval: 5, periodicity: StockChartXPeriodicity.MINUTE,
        },
        {
          interval: 15, periodicity: StockChartXPeriodicity.MINUTE,
        },
        {
          interval: 30, periodicity: StockChartXPeriodicity.MINUTE,
        },
      ],
    },
    {
      active: false,
      period: 'Hours',
      periodicities: [StockChartXPeriodicity.HOUR],
      timeFrames: [
        {
          interval: 1, periodicity: StockChartXPeriodicity.HOUR,

        },
        {
          interval: 2, periodicity: StockChartXPeriodicity.HOUR,
        },
        {
          interval: 3, periodicity: StockChartXPeriodicity.HOUR,
        },
        {
          interval: 4, periodicity: StockChartXPeriodicity.HOUR,
        }
      ]
    },
    {
      active: false,
      period: 'Days',
      periodicities: [StockChartXPeriodicity.DAY, StockChartXPeriodicity.WEEK, StockChartXPeriodicity.YEAR],
      timeFrames: [
        {
          interval: 1, periodicity: StockChartXPeriodicity.DAY,
        },
        {
          interval: 1, periodicity: StockChartXPeriodicity.WEEK,
        },
        {
          interval: 1, periodicity: StockChartXPeriodicity.MONTH,
        }
      ]
    },
    {
      active: false,
      period: 'Range',
      periodicities: [StockChartXPeriodicity.RANGE],
      timeFrames: [{
        interval: 5, periodicity: StockChartXPeriodicity.RANGE,
      },
        { interval: 10, periodicity: StockChartXPeriodicity.RANGE },
        { interval: 15, periodicity: StockChartXPeriodicity.RANGE },
      ]
    },
    {
      active: false,
      period: 'Renko',
      periodicities: [StockChartXPeriodicity.RENKO],
      timeFrames: [{
        interval: 4, periodicity: StockChartXPeriodicity.RENKO,
      },
        { interval: 5, periodicity: StockChartXPeriodicity.RENKO },
        { interval: 10, periodicity: StockChartXPeriodicity.RENKO },
      ]
    },

    {
      active: false,
      period: 'Volume',
      periodicities: [StockChartXPeriodicity.VOLUME],
      timeFrames: [{
        interval: 1000, periodicity: StockChartXPeriodicity.VOLUME,
      },
        { interval: 2500, periodicity: StockChartXPeriodicity.VOLUME },
        { interval: 5000, periodicity: StockChartXPeriodicity.VOLUME }
      ]
    },
    {
      active: false,
      period: 'Ticks',
      periodicities: [StockChartXPeriodicity.TICK],
      timeFrames: [
        { interval: 500, periodicity: StockChartXPeriodicity.TICK },
        { interval: 1000, periodicity: StockChartXPeriodicity.TICK },
        { interval: 5000, periodicity: StockChartXPeriodicity.TICK },

      ]
    },

  ];
  periodOptions: any = [
    {
      period: 'Days',
      active: false,
      periodicity: StockChartXPeriodicity.DAY,
      timeFrames: [
        { interval: 1, periodicity: StockChartXPeriodicity.DAY },
        { interval: 3, periodicity: StockChartXPeriodicity.DAY },
        { interval: 5, periodicity: StockChartXPeriodicity.DAY },

      ]
    },
    {
      period: 'Weeks',
      active: false,
      periodicity: StockChartXPeriodicity.WEEK,
      timeFrames: [
        { interval: 1, periodicity: StockChartXPeriodicity.WEEK },
        { interval: 2, periodicity: StockChartXPeriodicity.WEEK },
        { interval: 3, periodicity: StockChartXPeriodicity.WEEK },
      ]
    },
    {
      period: 'Months',
      active: false,
      periodicity: StockChartXPeriodicity.MONTH,
      timeFrames: [
        { interval: 1, periodicity: StockChartXPeriodicity.MONTH },
        { interval: 3, periodicity: StockChartXPeriodicity.MONTH },
        { interval: 6, periodicity: StockChartXPeriodicity.MONTH },
      ]
    },
    {
      period: 'Years',
      active: false,
      periodicity: StockChartXPeriodicity.YEAR,
      timeFrames: [
        { interval: 1, periodicity: StockChartXPeriodicity.YEAR },
        { interval: 2, periodicity: StockChartXPeriodicity.YEAR },
      ]
    },
  ];
  timeFrameOptions = [
    { interval: 30, periodicity: StockChartXPeriodicity.SECOND },
    { interval: 1, periodicity: StockChartXPeriodicity.MINUTE },
    { interval: 5, periodicity: StockChartXPeriodicity.MINUTE },
    { interval: 10, periodicity: StockChartXPeriodicity.MINUTE },
    { interval: 15, periodicity: StockChartXPeriodicity.MINUTE },
    { interval: 1, periodicity: StockChartXPeriodicity.HOUR },
    { interval: 4, periodicity: StockChartXPeriodicity.HOUR },
    { interval: 1, periodicity: StockChartXPeriodicity.DAY },
    { interval: 1, periodicity: StockChartXPeriodicity.WEEK },
    { interval: 1, periodicity: StockChartXPeriodicity.MONTH },
    { interval: 1, periodicity: StockChartXPeriodicity.YEAR },
  ] as ITimeFrame[];

  constructor(private _notifier: NotifierService) {
  }

  getTimeFrame(timeFrame: ITimeFrame): string {
    const label = this.getTimeFrameLabel(timeFrame.periodicity);
    return `${timeFrame.interval} ${label}`;
  }

  getTimeFrameLabel(periodicity) {
    return TimeFrame.periodicityToString(periodicity);
  }

  deletePeriod(frame: TimeFrame, option: any) {
    option.timeFrames = option.timeFrames.filter(item => item !== frame);
  }

  deleteInterval(frame: any, option: any) {
    option.timeFrames = option.timeFrames.filter(item => item !== frame);
  }

  addPeriod() {
    const interval = this.peridInterval;
    const periodicity = this.periodPeriodicity;
    const frame = { interval, periodicity };
    const period = this.periodOptions.find(item => item.periodicity === periodicity);
    const timeFrames = period?.timeFrames;
    if (timeFrames && !timeFrames.some(item => item.interval === interval)) {
      timeFrames.push(frame);
      period.timeFrames = timeFrames.sort((a, b) => a.interval - b.interval);
    }
  }

  addFrameInterval() {
    const interval = this.timeInterval;
    const periodicity = this.timePeriodicity;
    const frame = { interval, periodicity };
    const intervalOption = this.intervalOptions
      .find(item => {
        return item.periodicities.includes(periodicity);
      });
    const timeFrames = intervalOption.timeFrames;
    if (timeFrames && !timeFrames.some(item => compareTimeFrames(item, frame))) {
      timeFrames.push(frame);
      intervalOption.timeFrames = TimeFrame.sortTimeFrames(timeFrames);
    }
  }

  selectTimePeriod(frame) {
    this.timePeriod = frame;
  }

  updateChartBars() {
    const periodTime = TimeFrame.timeFrameToTimeInterval(this.timePeriod);
    const intervalTime = TimeFrame.timeFrameToTimeInterval(this.timeFrame);
    const endDate = new Date();
    const startDate = new Date(Date.now() - periodTime);
    this.chart.setDates(startDate, endDate);
    this.chart.sendBarsRequest();

    this.periodOptions = this.periodOptions.map(item => {
      item.timeFrames = item.timeFrames.map(frame => {
        frame.disabled = intervalTime > TimeFrame.timeFrameToTimeInterval(frame);
        return frame;
      });
      return item;
    });
  }

  isIntervalSelected(frame: ITimeFrame) {
    return compareTimeFrames(this.timeFrame, frame);
  }

  isPeriodSelected(frame: ITimeFrame) {
    return compareTimeFrames(this.timePeriod, frame);
  }
}

function compareTimeFrames(obj1: ITimeFrame, obj2: ITimeFrame) {
  if (!obj1 || !obj2)
    return;

  return obj2.interval === obj1.interval
    && obj2.periodicity === obj1.periodicity;
}
