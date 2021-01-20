import { Component, Injector, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { FormComponent } from 'base-components';
import { IHistoryItem } from 'real-trading';
import { BehaviorSubject } from 'rxjs';
import { HistoryRepository, IConnection, IInstrument, Periodicity } from 'trading';
import { OrderDuration, OrderType } from 'trading';


const historyParams = {
  Periodicity: Periodicity.Hourly,
  BarSize: 1,
  Skip: 0,
  BarCount: 10
};

export interface DomFormSettings {
  showInstrumentChange: boolean;
  closePositionButton: boolean;
  showOHLVInfo: boolean;
  showFlattenButton: boolean;
  showPLInfo: boolean;
  showIcebergButton: boolean;
  roundPL: boolean;
  includeRealizedPL: boolean;
}

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
  @Input() showUnits = true;
  @Input() isFormOnTop = false;
  @Input() isExtended = false;

  _settings: DomFormSettings = {
    showInstrumentChange: true,
    closePositionButton: true,
    showOHLVInfo: true,
    showFlattenButton: true,
    showPLInfo: true,
    showIcebergButton: true,
    roundPL: false,
    includeRealizedPL: false,
  };

  get setting() {
    return this._settings;
  }

  @Input() set domSettings(value) {
    Object.assign(this._settings, value);
  }

  @Input() set instrument(value: IInstrument) {
    if (this.instrument$.getValue()?.id !== value.id)
      this.instrument$.next(value);
  }

  get instrument() {
    return this.instrument$.getValue();
  }

  get isIce() {
    return this.formValue.isIce;
  }

  get isIceEnabled() {
    return this.setting.showIcebergButton;
  }

  get isTypeStopLimit() {
    return this.formValue.type === OrderType.StopLimit;
  }

  get isIceAmountVisible() {
    return this.isIce && this.isIceEnabled && this.isTypeStopLimit;
  }

  amountButtons = [
    { value: 1 }, { value: 2, black: true },
    { value: 10 }, { value: 50 },
    { value: 100 }, { value: 5 }
  ];
  typeButtons = [
    { label: 'LMT', value: OrderType.Limit }, { label: 'STP MKT', value: OrderType.StopMarket, black: true },
    { label: 'MKT', value: OrderType.Market },
    // { label: 'OCO', value: 'OCO', black: true },
    { label: 'STP LMT', value: OrderType.StopLimit, black: true },
    { label: 'MIT', value: OrderType.MIT },
    { label: 'LIT', value: OrderType.LIT },

    // { label: 'ICE', value: OrderType.ICE, black: true },
  ];
  tifButtons = [
    // { label: 'DAY', value: OrderDuration.DAY  },{ label: 'GTD', value: OrderDuration.GTD }, { label: 'GTC', value: OrderDuration.GTC, black: true },
    { label: 'FOK', value: OrderDuration.FOK, black: true },
    { label: 'IOC', value: OrderDuration.IOC, black: true },
  ];
  editAmount = false;
  editIceAmount = false;

  get amount() {
    return this.formValue.amount;
  }

  get iceAmount() {
    return this.formValue.iceAmount;
  }

  constructor(
    protected _injector: Injector,
    private _historyRepository: HistoryRepository,
  ) {
    super();
    this.autoLoadData = false;
  }

  protected _handleConnection(connection: IConnection) {
    super._handleConnection(connection);
    this._historyRepository = this._historyRepository.forConnection(connection);

    if (connection != null)
      this._loadHistory();
  }

  private _loadHistory() {
    const instrument = this.instrument;
    return this._historyRepository.getItems({
      id: instrument.id,
      Exchange: instrument.exchange,
      ...historyParams,
    }).subscribe(
      res => {
        const data = res.data;
        const length = data.length;
        this.dailyInfo = data[length - 1];
        this.prevItem = data[length - 2];
      },
      err => this._notifier.showError(err)
    );
  }

  createForm() {
    return new FormGroup({
      quantity: new FormControl(10, Validators.required),
      type: new FormControl(null, Validators.required),
      duration: new FormControl(null, Validators.required),
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
      amount: new FormControl(1),
      isIce: new FormControl(false),
      iceAmount: new FormControl(10),

    });
  }

  increaseQuantity(value: number) {
    const quantity = (+this.form.value.quantity) + value;
    this.form.patchValue({ quantity });
  }

  getPl() {
    const precision = this.setting.roundPL ? 0 : 5;
    if (this.dailyInfo)
      return ((+this.form.value.quantity) * Math.abs(this.dailyInfo.close - this.dailyInfo.open))
        .toFixed(precision);
  }


  toggleIce() {
    const { isIce } = this.formValue;
    this.form.patchValue({
      isIce: !isIce
    });
  }
}


