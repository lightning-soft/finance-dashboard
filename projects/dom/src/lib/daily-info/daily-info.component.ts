import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
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
export class DailyInfoComponent implements AfterViewInit {

  private _formatter = InstrumentFormatter.forInstrument();
  private _dailyInfo: IHistoryItem;

  private _isInit = false;

  @ViewChild('incomeNode', { static: true }) incomeNode: ElementRef;
  @ViewChild('incomePercentageNode', { static: true }) incomePercentageNode: ElementRef;

  @ViewChild('high', { static: true }) highNode: ElementRef;
  @ViewChild('low', { static: true }) lowNode: ElementRef;
  @ViewChild('open', { static: true }) openNode: ElementRef;
  @ViewChild('volume', { static: true }) volumeNode: ElementRef;

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

  income: number;
  incomePercentage: number;

  formattedIncome: string;
  formattedIncomePercentage: string;

  @Input() set historyItem(value: IHistoryItem) {
    if (this._dailyInfo === value)
      return;
    this._dailyInfo = value;
  }

  ngAfterViewInit() {
    this._isInit = true;
    this.handleDailyInfo(this._dailyInfo);
  }

  handleDailyInfo(value: IHistoryItem) {
    const prevHistoryItem = this._dailyInfo;
    this.historyItem = value;
    if (this._isInit)
      this.updateIncome(prevHistoryItem);
  }

  updateIncome(prevHistoryItem: IHistoryItem): void {
    if (this.dailyInfo) {
      const income = this.dailyInfo.close - this.dailyInfo.open;
      const incomePercentage = (income / this.dailyInfo.close) * 100;
      if (income !== this.income) {
        this.income = income;
        this.formattedIncome = this.formatPrice(this.income);
        this.incomeNode.nativeElement.textContent = this.formattedIncome;
      }
      if (incomePercentage !== this.incomePercentage) {
        this.incomePercentage = incomePercentage;
        this.formattedIncomePercentage = ' (' + this.incomePercentage.toFixed(2) + '%)';
        this.incomePercentageNode.nativeElement.textContent = this.formattedIncomePercentage;
      }
    } else {
      this.formattedIncome = '-';
      this.formattedIncomePercentage = '';
    }

    if (this._dailyInfo?.high !== prevHistoryItem?.high)
      this.highNode.nativeElement.textContent = this.formatPrice(this._dailyInfo?.high);
    if (this._dailyInfo?.low !== prevHistoryItem?.low)
      this.lowNode.nativeElement.textContent = this.formatPrice(this._dailyInfo?.low);
    if (this._dailyInfo?.open !== prevHistoryItem?.open)
      this.openNode.nativeElement.textContent = this.formatPrice(this._dailyInfo?.open);
    if (this._dailyInfo?.volume !== prevHistoryItem?.volume)
      this.volumeNode.nativeElement.textContent = this._dailyInfo?.volume ?? '-';
  }

  private formatPrice(price) {
    return price != null ? this._formatter.format(price) : '-';
  }
}
