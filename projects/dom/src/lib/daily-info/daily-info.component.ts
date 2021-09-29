import { Component, Input } from '@angular/core';
import { InstrumentFormatter } from 'data-grid';
import { IHistoryItem, IInstrument } from 'trading';

interface IFormattedHistoryItem {
  high: string;
  low: string;
  open: string;
  close: string;
  volume: string | number;
}

@Component({
  selector: 'daily-info',
  templateUrl: './daily-info.component.html',
  styleUrls: ['./daily-info.component.scss']
})
export class DailyInfoComponent {
  private _formatter = InstrumentFormatter.forInstrument();
  private _dailyInfo: IHistoryItem;

  public formattedDailyInfo: IFormattedHistoryItem;

  @Input() set dailyInfo(value: IHistoryItem) {
    this.historyItem = value;
    this.updateIncome();
  }

  get dailyInfo(): IHistoryItem {
    return this._dailyInfo;
  }

  private _instrument: IInstrument;
  public get instrument(): IInstrument {
    return this._instrument;
  }

  @Input()
  public set instrument(value: IInstrument) {
    this._instrument = value;
    this._formatter = InstrumentFormatter.forInstrument(value);
  }

  @Input() showInstrumentChange: boolean;
  @Input() showOHLVInfo: boolean;
  volume: number | string;
  income: number | string;
  incomePercentage: string | number;

  @Input() set historyItem(value: IHistoryItem) {
    if (this._dailyInfo === value)
      return;
    this._dailyInfo = value;
    this.formattedDailyInfo = this._getFormattedDailyInfo(value);
    this.updateIncome();
  }

  updateIncome(): void {
    if (this.dailyInfo) {
      const income = this.dailyInfo.close - this.dailyInfo.open;
      this.incomePercentage = ((income / this.dailyInfo.close) * 100).toFixed(2);
      this.income = this._formatter.format(income);
    } else {
      this.income = null;
      this.incomePercentage = null;
    }
  }

  getInfo(data: number | string): number | string {
    return data ?? '-';
  }

  private _getFormattedDailyInfo(item: IHistoryItem): IFormattedHistoryItem {
    return {
      high: this._formatter.format(item?.high) || '-',
      low: this._formatter.format(item?.low) || '-',
      open: this._formatter.format(item?.open) || '-',
      close: this._formatter.format(item?.close) || '-',
      volume: item?.volume ?? '-'
    };
  }
}
