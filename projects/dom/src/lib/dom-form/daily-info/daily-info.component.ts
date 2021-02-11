import { Component, Input } from '@angular/core';
import { IHistoryItem, ITrade } from 'trading';

@Component({
  selector: 'daily-info',
  templateUrl: './daily-info.component.html',
  styleUrls: ['./daily-info.component.scss']
})
export class DailyInfoComponent {
  @Input() dailyInfo: IHistoryItem;
  @Input() prevItem: IHistoryItem;
  @Input() instrument;
  @Input() showInstrumentChange: boolean;
  @Input() showOHLVInfo: boolean;

  @Input() set trade(value: ITrade) {
    if (this.dailyInfo && this.shouldUpdateCurrentItem(value)) {
      const precision = this.instrument?.precision ?? 4;

      this.dailyInfo.close = value.price;
      if (value.price > this.dailyInfo.high) {
        this.dailyInfo.high = value.price;
      }
      if (value.price < this.dailyInfo.low) {
        this.dailyInfo.low = value.price;
      }

      this.dailyInfo.volume = this.dailyInfo.volume + value.volume;
      this.volume = this.dailyInfo.volume;
      const income = this.dailyInfo.close - this.prevItem.close;
      this.incomePercentage = ((income / this.dailyInfo.close) * 100).toFixed(precision);
      this.income = income.toFixed(precision);
    }
  }

  volume: number | string;
  income: number | string;
  incomePercentage: string | number;

  shouldUpdateCurrentItem(trade) {
    const date = new Date(trade.timestamp);
    return isSameDay(date, this.dailyInfo.date) && date > this.dailyInfo.date;
  }
}
function isSameDay(date, secondDate) {
  return date.getDate() == secondDate.getDate() && date.getMonth() == secondDate.getMonth()
    && date.getFullYear() == secondDate.getFullYear();
}
