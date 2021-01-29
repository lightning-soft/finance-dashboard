import { Component, Input, OnInit } from '@angular/core';
import { IHistoryItem } from 'trading';
import { ITrade } from 'trading';

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
      this.dailyInfo.close = value.price;
      if (value.price > this.dailyInfo.high) {
        this.dailyInfo.high = value.price;
      }
      if (value.price < this.dailyInfo.low) {
        this.dailyInfo.low = value.price;
      }
      this.dailyInfo.volume = this.dailyInfo.volume + (value.volume / 1000);
      this.updateIncome();
    }
  }

  income: number| string;
  incomePercentage: string | number;

  getVolume() {
    return this.dailyInfo.volume.toFixed(this.instrument?.precision ?? 4);
  }
  shouldUpdateCurrentItem(trade) {
    const date = new Date(trade.timestamp);
    return isSameDay(date, this.dailyInfo.date) && date > this.dailyInfo.date;
  }
  updateIncome() {
    const income = this.dailyInfo.close - this.prevItem.close;
    this.incomePercentage = (income / this.dailyInfo.close).toFixed(this.instrument?.precision ?? 4);
    this.income = income.toFixed(this.instrument?.precision ?? 4);
    // console.log('income', (this.income / this.dailyInfo.close).toFixed(4));
  }
}
function isSameDay(date, secondDate) {
  return date.getDate() == secondDate.getDate() && date.getMonth() == secondDate.getMonth()
    && date.getFullYear() == secondDate.getFullYear();
}
