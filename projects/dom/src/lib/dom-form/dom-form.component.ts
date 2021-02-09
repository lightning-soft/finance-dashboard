import { Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { QuantityPositions } from 'dom';
import { IHistoryItem } from 'real-trading';
import { BehaviorSubject } from 'rxjs';
import { HistoryRepository, IConnection, IInstrument, OrderDuration, OrderType, Periodicity } from 'trading';
import { QuantityInputComponent } from 'base-order-form';
import { BaseOrderForm } from 'base-order-form';
import { skip } from 'rxjs/operators';
import { PositionsRepository } from "../../../../trading";

const historyParams = {
  Periodicity: Periodicity.Hourly,
  BarSize: 1,
  Skip: 0,
  BarCount: 10
};

export enum FormActions {
  ClosePositions,
  Flatten,
  CloseOrders,
  CloseBuyOrders,
  CloseSellOrders,
  SelectQuantity,
}

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
export class DomFormComponent extends BaseOrderForm {
  FormActions = FormActions;
  instrument$ = new BehaviorSubject<IInstrument>(null);
  dailyInfo: IHistoryItem;
  prevItem: IHistoryItem;

  @ViewChild('quantity')
  public quantitySelect: QuantityInputComponent;
  @Input() trade;
  @Input() showUnits = true;
  @Input() isFormOnTop = false;
  @Input() isExtended = false;
  @Input() accountId;


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

  @Output()
  actions = new EventEmitter<FormActions>();


  get setting() {
    return this._settings;
  }

  @Input() set domSettings(value) {
    Object.assign(this._settings, value);
  }

  @Input() set instrument(value: IInstrument) {
    if (this.instrument$.getValue()?.id !== value.id) {
      this.instrument$.next(value);
    }
  }

  get instrument() {
    return this.instrument$.getValue();
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
    { label: 'LMT', value: OrderType.Limit },
    { label: 'STP MKT', value: OrderType.StopMarket, black: true },
    { label: 'MKT', value: OrderType.Market },
    // { label: 'OCO', value: 'OCO', black: true },
    { label: 'STP LMT', value: OrderType.StopLimit, black: true },
    // { label: 'MIT', value: OrderType.MIT },
    // { label: 'LIT', value: OrderType.LIT },

    // { label: 'ICE', value: OrderType.ICE, black: true },
  ];
  tifButtons = [
    { label: 'DAY', value: OrderDuration.DAY },
    { label: 'GTD', value: OrderDuration.GTD },
    // { label: 'GTC', value: OrderDuration.GTC, black: true },
    { label: 'FOK', value: OrderDuration.FOK, black: true },
    { label: 'IOC', value: OrderDuration.IOC, black: true },
  ];
  editAmount = false;
  editIceAmount = false;

  get amount() {
    return this.formValue['amount'];
  }


  constructor(
    protected _injector: Injector,
    private _historyRepository: HistoryRepository,
    protected positionsRepository: PositionsRepository,
) {
    super();
    this.autoLoadData = false;
  }

  protected _handleConnection(connection: IConnection) {
    super._handleConnection(connection);
    this._historyRepository = this._historyRepository.forConnection(connection);
    this.positionsRepository = this.positionsRepository.forConnection(connection);
    this.loadPositions();

    if (connection != null) {
      this._loadHistory();
      this.instrument$
        .pipe(
          skip(1),
          untilDestroyed(this)
        )
        .subscribe((res) => {
          this._loadHistory();
        });
    }
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
    const type = this.typeButtons.find(i => i.black);
    const duration = this.tifButtons.find(i => i.black);

    return new FormGroup({
      quantity: new FormControl(10, Validators.required),
      type: new FormControl(type.value, Validators.required),
      duration: new FormControl(duration.value, Validators.required),
      stopLoss: new FormControl({
        stopLoss: false,
        ticks: 10,
        unit: 'ticks'
      }),
      takeProfit: new FormControl({
        takeProfit: false,
        ticks: 12,
        unit: 'ticks'
      }),
      amount: new FormControl(1),
      isIce: new FormControl(false),
      iceAmount: new FormControl(10),
    });
  }


  increaseQuantity(value: number) {
   this.quantitySelect.currentItem.value += value;
  }

  getPl() {
    const precision = this.setting.roundPL ? 0 : 5;
    if (this.dailyInfo)
      return ((+this.form.value.quantity) * Math.abs(this.dailyInfo.close - this.dailyInfo.open))
        .toFixed(precision);
  }


  emit(action: FormActions) {
    this.actions.emit(action);
  }

  selectQuantityByPosition(position: QuantityPositions) {
    this.quantitySelect.selectByPosition(position);
  }
}


