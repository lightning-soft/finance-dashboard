import { Component, Input } from '@angular/core';
import { IHistoryItem } from 'trading';
import { TradePrint } from 'trading';

@Component({
  selector: 'daily-info',
  templateUrl: './daily-info.component.html',
  styleUrls: ['./daily-info.component.scss']
})
export class DailyInfoComponent {
  _dailyInfo: IHistoryItem;
  @Input() set dailyInfo(value: IHistoryItem) {
    this._dailyInfo = value;
    this.updateIncome();
  }

  get dailyInfo() {
    return this._dailyInfo;
  }

  @Input() prevItem: IHistoryItem;
  @Input() instrument;
  @Input() showInstrumentChange: boolean;
  @Input() showOHLVInfo: boolean;
  volume: number | string;
  income: number | string;
  incomePercentage: string | number;

  @Input() set trade(value: TradePrint) {
    if (this.dailyInfo && this.shouldUpdateCurrentItem(value)) {

      this.dailyInfo.close = value.price;
      if (value.price > this.dailyInfo.high) {
        this.dailyInfo.high = value.price;
      }
      if (value.price < this.dailyInfo.low) {
        this.dailyInfo.low = value.price;
      }

      this.dailyInfo.volume = this.dailyInfo.volume + value.volume;
      this.updateIncome();
    }
  }

  updateIncome() {
    if (this.dailyInfo) {
      const precision = this.instrument?.precision ?? 4;
      const income = this.dailyInfo.close - this.prevItem.close;
      this.incomePercentage = ((income / this.dailyInfo.close) * 100).toFixed(precision);
      this.income = income.toFixed(precision);
    }
  }

  shouldUpdateCurrentItem(trade) {
    const date = new Date(trade.timestamp);
    return isSameDay(date, this.dailyInfo.date) && date > this.dailyInfo.date;
  }
}

function isSameDay(date, secondDate) {
  return date.getDate() == secondDate.getDate() && date.getMonth() == secondDate.getMonth()
    && date.getFullYear() == secondDate.getFullYear();
}
