import { Component, Injector, Input } from '@angular/core';
import { FormComponent } from 'base-components';
import { FormControl, FormGroup } from '@angular/forms';
import { IInstrument } from 'trading';
import { AccountsManager } from 'accounts-manager';
import { HistoryRepository } from 'trading';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { IHistoryItem } from 'real-trading';
import { ITrade, Periodicity } from 'trading';


const historyParams = {
  Periodicity: Periodicity.Hourly,
  BarSize: 1,
  Skip: 0,
  BarCount: 10
};

@Component({
  selector: 'dom-form',
  templateUrl: './dom-form.component.html',
  styleUrls: ['./dom-form.component.scss']
})
@UntilDestroy()
export class DomFormComponent extends FormComponent<any> {
  instrument$ = new BehaviorSubject<IInstrument>(null);
  dailyInfo: IHistoryItem;
  prevItem: IHistoryItem;
  @Input() trade;
  @Input() set instrument(value: IInstrument) {
    if (this.instrument$.getValue()?.id !== value.id)
      this.instrument$.next(value);
  }


  get instrument() {
    return this.instrument$.getValue();
  }

  amountButtons = [
    {label: 1}, {label: 2, black: true},
    {label: 10}, {label: 50},
    {label: 100}, {label: 5}
  ];
  typeButtons = [
    {label: 'LMT', value: 'LMT'}, {label: 'STP MKT', value: 'STP MKT', black: true},
    {label: 'OCO', value: 'OCO', black: true},
    {label: 'STP LMT', value: 'STP LMT', black: true},
    {label: 'ICE', value: 'ICE', black: true},
    // {label: 10},
  ];
  tifButtons = [
    {label: 'DAY', value: 'DAY'}, {label: 'GTC', value: 'GTC', black: true},
    {label: 'FOK', value: 'FOK', black: true},
    {label: 'IOC', value: 'IOC', black: true},
  ];

  constructor(
    protected _injector: Injector,
    private _historyRepository: HistoryRepository,
  ) {
    super();
    this.autoLoadData = false;
    this._accountsManager.connections
      .pipe(
        switchMap(() => {
          const connection = this._accountsManager.getActiveConnection();
          this._historyRepository = this._historyRepository.forConnection(connection);
          return this.instrument$;
        }),
        filter((item) => item != null),
        switchMap((item) => {
          return this._historyRepository.getItems({
            id: item.symbol,
            ...{
              ...historyParams, Exchange: item.exchange,
            }
          });
        }),
        untilDestroyed(this),
      )
      .subscribe((res) => {
        this.dailyInfo = res.data[res.data.length - 1];
        this.prevItem = res.data[res.data.length - 2];
      });
  }





  createForm() {
    return new FormGroup({
      quantity: new FormControl(),
      type: new FormControl(),
      tif: new FormControl(),
      sl: new FormControl({
        stopLoss: false,
        count: 10,
        unit: 'ticks'
      }),
      tp: new FormControl({
        takeProfit: false,
        count: 12,
        unit: 'ticks'
      }),

    });
  }

  increaseQuantity(value: number) {
    const quantity = (+this.form.value.quantity) + value;
    this.form.patchValue({quantity});
  }

  getPl() {
    if (this.dailyInfo)
      return (+this.form.value.quantity) * Math.abs(this.dailyInfo.close - this.dailyInfo.open);
  }


}


