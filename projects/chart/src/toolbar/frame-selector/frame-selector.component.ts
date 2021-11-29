import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IChart, ITimeFrame, StockChartXPeriodicity, TimeFrame } from '../../models';
import { NotifierService } from 'notifier';
import { enumarablePeriodicities } from '../../datafeed/TimeFrame';

@Component({
  selector: 'frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.scss']
})
export class FrameSelectorComponent {
  timeInterval = 1;
  timePeriodicity = StockChartXPeriodicity.HOUR;

  peridInterval = 3;
  periodPeriodicity = StockChartXPeriodicity.DAY;

  isLeaving = false;
  actives = {};
  intervalActives = {};


  @Input() chart: IChart;

  @Output() periodAdded = new EventEmitter();
  @Output() intervalAdded = new EventEmitter();


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

  private _timePeriod: ITimeFrame;

  get timePeriod() {
    return this.chart.periodToLoad;
  }

  set timePeriod(value) {
    if (value === this._timePeriod)
      return;

    this.chart.periodToLoad = value;
    this.timePeriodChange.emit(value);
    this.updateChartBars();
  }

  @Output() timePeriodChange = new EventEmitter();

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

  @Input() intervalOptions = [];
  @Input() periodOptions: any = [];

  constructor(private _notifier: NotifierService) {
  }

  ngOnInit() {
    const timeFrame = this.timePeriod;
    const option = this.periodOptions.find(item => {
      return item.timeFrames.some(frame => compareTimeFrames(timeFrame, frame));
    });
    if (option)
      this.actives[option.period] = true;

    const timeInterval = this.timeFrame;
    const intervalOption = this.intervalOptions.find(item => {
      return item.timeFrames.some(frame => compareTimeFrames(timeInterval, frame));
    });
    if (intervalOption)
      this.intervalActives[intervalOption.period] = true;
  }

  getTimeFrame(timeFrame: ITimeFrame): string {
    const label = this.getTimeFrameLabel(timeFrame.periodicity);
    const suffix = enumarablePeriodicities[timeFrame.periodicity] ? 't' : '';

    return `${timeFrame.interval}${suffix} ${label}`;
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
    this.periodAdded.emit(frame);
  }

  addFrameInterval() {
    const interval = this.timeInterval;
    const periodicity = this.timePeriodicity;
    const frame = { interval, periodicity };
    this.intervalAdded.emit(frame);
  }

  selectTimePeriod(frame) {
    this.timePeriod = frame;
  }

  updateChartBars() {
    if (this.timeFrame == null || this.timeFrame == null)
      return;

    const periodTime = TimeFrame.timeFrameToTimeInterval(this.timePeriod);
    const intervalTime = TimeFrame.timeFrameToTimeInterval(this.timeFrame);
    const endDate = new Date();
    const startDate = new Date(Date.now() - periodTime);
    startDate.setHours(0, 0, 0, 0);
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

export function compareTimeFrames(obj1: ITimeFrame, obj2: ITimeFrame) {
  if (!obj1 || !obj2)
    return;

  return obj2.interval === obj1.interval
    && obj2.periodicity === obj1.periodicity;
}
