import { Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { QuantityPositions } from 'dom';
import { BehaviorSubject } from 'rxjs';
import {
  compareInstruments,
  IInstrument,
  IOrder,
  isForbiddenOrder,
  OrderDuration,
  OrderSide,
  OrderType,
  PositionsRepository
} from 'trading';
import { BaseOrderForm, OcoStep } from '../base-order-form';
import { QuantityInputComponent } from '../quantity-input/quantity-input.component';
import { ITypeButton } from '../type-buttons/type-buttons.component';

export enum FormActions {
  ClosePositions,
  Flatten,
  CloseOrders,
  CloseBuyOrders,
  CloseSellOrders,
  SelectQuantity,
  CreateBuyMarketOrder,
  CreateSellMarketOrder,
  CreateOcoOrder,
  CancelOcoOrder
}

export interface DomFormSettings {
  buyButtonsBackgroundColor: string;
  flatButtonsBackgroundColor: string;
  buyButtonsFontColor: string;
  flatButtonFontColor: string;
  sellButtonsBackgroundColor: string;
  cancelButtonBackgroundColor: string;
  sellButtonsFontColor: string;
  cancelButtonFontColor: string;
  formSettings: {
    showInstrumentChange: boolean;
    closePositionButton: boolean;
    showOHLVInfo: boolean;
    showFlattenButton: boolean;
    showPLInfo: boolean;
    showIcebergButton: boolean;
    roundPL: boolean;
    includeRealizedPL: boolean;
  };
}

interface IAmountButton {
  value: number;
  black?: boolean;
}

type SideOrderForm = { [key in Partial<keyof IOrder>]: FormControl } & {
  stopLoss: FormControl;
  isIce: FormControl;
  takeProfit: FormControl;
};

export type SideOrderFormState = Partial<SideOrderForm> & {
  amountButtons?: IAmountButton[];
}

@Component({
  selector: 'side-form',
  templateUrl: './side-order-form.component.html',
  styleUrls: ['./side-order-form.component.scss']
})
@UntilDestroy()
export class SideOrderFormComponent extends BaseOrderForm {
  FormActions = FormActions;
  instrument$ = new BehaviorSubject<IInstrument>(null);
  private _ocoStep = OcoStep.None;

  totalQuantity: number;
  buyQuantity: number;
  sellQuantity: number;

  get isOcoSelected() {
    return this._ocoStep !== OcoStep.None;
  }

  @Input() set ocoStep(value) {
    this._ocoStep = value;
    if (value === OcoStep.Fist) {
      this.form.patchValue({ type: OrderType.Limit });
      this.typeButtons = this._typeButtons.map(item => {
        const disabled = ![OrderType.Limit, 'OCO'].includes(item.value);
        return { ...item, disabled };
      });
    } else if (value === OcoStep.Second) {
      this.form.patchValue({ type: OrderType.StopMarket });
      this.typeButtons = this._typeButtons.map(item => {
        const disabled = ![OrderType.StopMarket, OrderType.StopLimit, 'OCO'].includes(item.value);
        return { ...item, disabled };
      });
    } else {
      this.typeButtons = this._typeButtons;
    }
  }

  @Input() set orders(value: IOrder[]) {
    this.buyQuantity = 0;
    this.sellQuantity = 0;

    value.forEach((item) => {
      if (isForbiddenOrder(item))
        return;

      if (item.side === OrderSide.Buy)
        this.buyQuantity += item.quantity;
      else if (item.side === OrderSide.Sell)
        this.sellQuantity += item.quantity;
    });

    this.totalQuantity = this.buyQuantity + this.sellQuantity;
  }

  @ViewChild('quantity')
  public quantitySelect: QuantityInputComponent;
  @Input() trade;
  @Input() showUnits = true;
  @Input() isFormOnTop = false;
  @Input() isExtended = false;
  @Input() tickSize: number;

  _accountId;
  get accountId() {
    return this._accountId;
  }

  @Input() set accountId(value) {
    if (this._accountId !== value) {
      this._accountId = value;
      this.form?.patchValue({ accountId: value });
    }
  }

  _settings: DomFormSettings = {
    buyButtonsBackgroundColor: '#4895F5',
    flatButtonsBackgroundColor: '#51535A',
    buyButtonsFontColor: '#fff',
    flatButtonFontColor: '#D0D0D2',
    sellButtonsBackgroundColor: '#C93B3B',
    cancelButtonBackgroundColor: '#51535A',
    sellButtonsFontColor: '#fff',
    cancelButtonFontColor: '#fff',
    formSettings: {
      showInstrumentChange: true,
      closePositionButton: true,
      showOHLVInfo: true,
      showFlattenButton: true,
      showPLInfo: true,
      showIcebergButton: true,
      roundPL: false,
      includeRealizedPL: false,
    }
  };

  @Output()
  actions = new EventEmitter<FormActions>();


  get setting() {
    return this._settings;
  }

  @Input() set domSettings(value) {
    this._settings = value;
  }

  @Input() set instrument(value: IInstrument) {
    if (value != null && !compareInstruments(this.instrument$.getValue(), value)) {
      this.instrument$.next(value);
      this.form?.patchValue({ symbol: value.symbol, exchange: value.exchange });
    }
  }

  get instrument() {
    return this.instrument$.getValue();
  }


  get isIceEnabled() {
    return this.formValue.type === OrderType.Limit && this.setting.formSettings.showIcebergButton;
  }

  get isTypeStopLimit() {
    return this.formValue.type === OrderType.StopLimit;
  }

  get isIceAmountVisible() {
    return this.isIce && this.isIceEnabled;
  }

  amountButtons: IAmountButton[] = [
    { value: 1 }, { value: 2, black: true },
    { value: 10 }, { value: 50 },
    { value: 100 }, { value: 5 }
  ];
  _typeButtons: ITypeButton[] = [
    { label: 'LMT', black: true, value: OrderType.Limit, selectable: true },
    { label: 'STP MKT', value: OrderType.StopMarket, black: true, selectable: true },
    {
      label: 'OCO', value: 'OCO', className: 'oco', selectable: false, onClick: () => {
        this.emit(FormActions.CreateOcoOrder);
      }, contextMenu: () => {
        this.emit(FormActions.CancelOcoOrder);
      }, black: true
    },
    { label: 'STP LMT', value: OrderType.StopLimit, black: true, selectable: true },
    // { label: 'MIT', value: OrderType.MIT },
    // { label: 'LIT', value: OrderType.LIT },

    // { label: 'ICE', value: OrderType.ICE, black: true },
  ];

  typeButtons = this._typeButtons;

  get typeSelectOptions() {
    return this.typeButtons.filter(item => item.selectable);
  }

  tifButtons: ITypeButton[] = [
    { label: 'DAY', black: true, value: OrderDuration.DAY, selectable: true },
    // { label: 'GTD', value: OrderDuration.GTD, selectable: true },
    { label: 'GTC', black: true, value: OrderDuration.GTC, selectable: true, },
    { label: 'FOK', black: true, value: OrderDuration.FOK, selectable: true },
    { label: 'IOC', black: true, value: OrderDuration.IOC, selectable: true },
  ];
  editIceAmount = false;

  get amount() {
    return this.formValue.amount;
  }

  constructor(
    protected _injector: Injector,
    protected positionsRepository: PositionsRepository,
  ) {
    super();
    this.autoLoadData = false;
  }

  loadState(state: SideOrderFormState): void {
    this.form.patchValue(state ?? {});
    if (state?.amountButtons)
      this.amountButtons = state.amountButtons;
  }

  getState(): SideOrderFormState {
    return {
      quantity: (this.form.controls as SideOrderForm).quantity.value,
      amountButtons: this.amountButtons
    };
  }

  positionsToQuantity() {
    if (this._positionsSum) {
      this.form.patchValue({ quantity: Math.abs(this._positionsSum) });
    }
  }

  createForm(): FormGroup {
    const type = this.typeButtons.find(i => i.black);
    const duration = OrderDuration.DAY;

    return new FormGroup({
      quantity: new FormControl(10, Validators.required),
      accountId: new FormControl(),
      exchange: new FormControl(this.instrument?.exchange),
      symbol: new FormControl(this.instrument?.symbol),
      type: new FormControl(type.value, Validators.required),
      duration: new FormControl(duration, Validators.required),
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
      iceQuantity: new FormControl(10),
    } as SideOrderForm);
  }

  increaseQuantity(value: number) {
    this.quantitySelect.currentItem.value += value;
  }


  emit(action: FormActions) {
    this.actions.emit(action);
  }

  selectQuantityByPosition(position: QuantityPositions) {
    this.quantitySelect.selectByPosition(position);
  }

  createBuyMarket() {
    this.emit(FormActions.CreateBuyMarketOrder);
  }

  createSellMarket() {
    this.emit(FormActions.CreateSellMarketOrder);
  }
}

export function getPriceSpecs(item: IOrder & { amount: number }, price: number, tickSize) {
  const priceSpecs: any = {};
  const multiplier = 1 / tickSize;
  price = (Math.ceil(price * multiplier) / multiplier);
  if ([OrderType.Limit, OrderType.StopLimit].includes(item.type)) {
    priceSpecs.limitPrice = price;
  }
  if ([OrderType.StopMarket, OrderType.StopLimit].includes(item.type)) {
    priceSpecs.stopPrice = price;
  }
  if (item.type === OrderType.StopLimit) {
    const offset = tickSize * item.amount;
    priceSpecs.stopPrice = price + (item.side === OrderSide.Sell ? offset : -offset);
  }
  return priceSpecs;
}
