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
    this.historyItem = value;
    this.updateIncome();
  }

  get dailyInfo() {
    return this._dailyInfo;
  }

  @Input() instrument;
  @Input() showInstrumentChange: boolean;
  @Input() showOHLVInfo: boolean;
  volume: number | string;
  income: number | string;
  incomePercentage: string | number;

  @Input() set historyItem(value: IHistoryItem) {
    if (this._dailyInfo === value)
      return;
    this._dailyInfo = value;
    this.updateIncome();
  }

  updateIncome() {
    if (this.dailyInfo) {
      const precision = this.instrument?.precision ?? 4;
      const income = this.dailyInfo.close - this.dailyInfo.open;
      this.incomePercentage = ((income / this.dailyInfo.close) * 100).toFixed(precision);
      this.income = income.toFixed(precision);
    } else {
      this.income = null;
      this.incomePercentage = null;
    }
  }

  getInfo(data: number | string) {
    return data ?? '-';
  }
}

function isSameDay(date, secondDate) {
  return date.getDate() == secondDate.getDate() && date.getMonth() == secondDate.getMonth()
    && date.getFullYear() == secondDate.getFullYear();
}
