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
import * as clone from 'lodash.clonedeep';

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
export interface FormActionData {
  action: FormActions;
  event: any;
}

export interface DomFormSettings {
  buyButtonsBackgroundColor: string;
  flatButtonsBackgroundColor: string;
  buyButtonsFontColor: string;
  flatButtonsFontColor: string;
  sellButtonsBackgroundColor: string;
  cancelButtonBackgroundColor: string;
  sellButtonsFontColor: string;
  cancelButtonFontColor: string;
  closePositionFontColor: '#D0D0D2';
  closePositionBackgroundColor: '#51535A';
  icebergBackgroundColor: '';
  icebergFontColor: '';
  tif: any;
  formSettings: {
    showInstrumentChange: boolean;
    closePositionButton: boolean;
    showLiquidateButton: boolean;
    showOHLVInfo: boolean;
    showFlattenButton: boolean;
    showPLInfo: boolean;
    showIcebergButton: boolean;
    roundPL: boolean;
    includeRealizedPL: boolean;
    showCancelButton: boolean;
    showBuyButton: boolean;
    showOrderConfirm: boolean;
    showCancelConfirm: boolean;
    showSellButton: boolean;
    showBracket: boolean;
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

export interface SideOrderFormState {
  amountButtons?: IAmountButton[];
  formData: { [key: string]: string };
  settings: any;
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
  @ViewChild('posBtn') posBtn;

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
    buyButtonsBackgroundColor: '#0C62F7',
    flatButtonsBackgroundColor: '#51535A',
    buyButtonsFontColor: '#fff',
    flatButtonsFontColor: '#D0D0D2',
    sellButtonsBackgroundColor: '#C93B3B',
    cancelButtonBackgroundColor: '#51535A',
    sellButtonsFontColor: '#fff',
    cancelButtonFontColor: '#fff',
    closePositionFontColor: '#D0D0D2',
    closePositionBackgroundColor: '#51535A',
    icebergBackgroundColor: '',
    icebergFontColor: '',
    formSettings: {
      showInstrumentChange: true,
      closePositionButton: true,
      showLiquidateButton: true,
      showOHLVInfo: true,
      showFlattenButton: true,
      showCancelButton: true,
      showBuyButton: true,
      showOrderConfirm: true,
      showCancelConfirm: true,
      showSellButton: true,
      showPLInfo: true,
      showIcebergButton: true,
      roundPL: false,
      showBracket: true,
      includeRealizedPL: false,
    },
    tif: {
      DAY: true,
      FOK: true,
      GTC: true,
      IOC: true,
      default: OrderDuration.DAY,
    },
  };

  @Output()
  actions = new EventEmitter<FormActionData>();


  get setting() {
    return this._settings;
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
    {value: 1},
    {value: 1, black: true},
    {value: 3},
    {value: 5},
    {value: 10},
    {value: 25}];
  _typeButtons: ITypeButton[] = [
    { label: 'LMT', visible: true, black: true, value: OrderType.Limit, selectable: true },
    { label: 'STP MKT', visible: true, value: OrderType.StopMarket, black: true, selectable: true },
    {
      label: 'OCO', visible: true, value: 'OCO', className: 'oco', selectable: false, onClick: () => {
        this.emit(FormActions.CreateOcoOrder);
      }, contextMenu: () => {
        this.emit(FormActions.CancelOcoOrder);
      }, black: true
    },
    { label: 'STP LMT', visible: true, value: OrderType.StopLimit, black: true, selectable: true },
    // { label: 'MIT', value: OrderType.MIT },
    // { label: 'LIT', value: OrderType.LIT },

    // { label: 'ICE', value: OrderType.ICE, black: true },
  ];

  typeButtons = this._typeButtons;

  get typeSelectOptions() {
    return this.typeButtons.filter(item => item.selectable);
  }

  tifButtons: ITypeButton[] = [
    { label: 'DAY', visible: true, black: true, value: OrderDuration.DAY, selectable: true },
    // { label: 'GTD', value: OrderDuration.GTD, selectable: true },
    { label: 'GTC', visible: true, black: true, value: OrderDuration.GTC, selectable: true, },
    { label: 'FOK', visible: true, black: true, value: OrderDuration.FOK, selectable: true },
    { label: 'IOC', visible: true, black: true, value: OrderDuration.IOC, selectable: true },
  ];
  editIceAmount = false;
  isLoadedAtFirst = false;

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

  loadState(state: Partial<SideOrderFormState>): void {
    this.form.patchValue(state?.formData ?? {});
    if (state?.amountButtons)
      this.amountButtons = state.amountButtons;
    if (state?.settings) {
      if (!this.isLoadedAtFirst && state.settings.tif?.default) {
        this.form.patchValue({ duration: state.settings.tif.default });
      // was  this.isLoadedAtFirst = true;
      }
      this._settings = { ...this._settings, ...state.settings };
      this.form.patchValue({ type: OrderType.Limit });

      const tif = clone(this._settings.tif);
      this.tifButtons = this.tifButtons.map(item => {
        const selectable = tif[item.value];
        item.selectable = selectable;
        item.visible = selectable;
        return item;
      });
    }
  }

  getState(): SideOrderFormState {
    const controls: SideOrderForm = this.form.controls as SideOrderForm;
    return {
      formData: {
        quantity: controls.quantity.value,
        stopLoss: controls.stopLoss.value,
        takeProfit: controls.takeProfit.value,
      },
      amountButtons: this.amountButtons,
      settings: this._settings,
    };
  }

  onUpdatePosSum = () => {
    if (this.posBtn && this.posBtn.nativeElement) {
      this.posBtn.nativeElement.innerText = this.positionsSum;
    }
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
        unitItem: 10,
        unit: 'ticks'
      }),
      takeProfit: new FormControl({
        takeProfit: false,
        unitItem: 12,
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


  emit(action: FormActions, event?) {
    this.actions.emit({ action, event });
  }

  selectQuantityByPosition(position: QuantityPositions) {
    this.quantitySelect.selectByPosition(position);
  }

  createBuyMarket( $event) {
    this.emit(FormActions.CreateBuyMarketOrder, $event);
  }

  createSellMarket( $event) {
    this.emit(FormActions.CreateSellMarketOrder,  $event);
  }
}

