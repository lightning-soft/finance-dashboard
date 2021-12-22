import { FormComponent } from 'base-components';
import {
  compareInstruments,
  IInstrument,
  IOrder,
  IPosition,
  OrderDuration,
  OrderType,
  PositionsRepository
} from 'trading';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Directive, Input, ViewChild } from '@angular/core';
import { AccountSelectComponent } from 'account-select';

const placeholder = '-';

@Directive()
export abstract class BaseOrderForm extends FormComponent<IOrder> {
  protected positionsRepository: PositionsRepository;
  instrument: IInstrument;
  private _position: IPosition;
  canClickPosButton = false;

  @ViewChild(AccountSelectComponent) private _accountsSelect: AccountSelectComponent;

  get accountId() {
    return this._accountsSelect?.account?.id;
  }

  @Input()
  set position(pos: IPosition) {
    this._position = pos;

    if (!this.instrument || !this._position) {
      this._positionsSum = null;
      this.canClickPosButton = false;
      return;
    }

    const posSum = this._position.buyVolume - this._position.sellVolume;
    this.isPositionsNegative = posSum < 0;
    this._positionsSum = posSum;
    this.canClickPosButton = !!posSum;
    requestAnimationFrame(this.onUpdatePosSum);
  }

  get position() {
    return this._position;
  }

  isPositionsNegative: boolean;
  protected _positionsSum: number;

  get positionsSum() {
    return this._positionsSum ?? placeholder;
  }

  loadPositions() {
    if (!this.accountId)
      return;

    this.positionsRepository.getItems({ accountId: this.accountId })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.position = res.data
          .find(item => compareInstruments(item.instrument, this.instrument));
      });
  }

  onUpdatePosSum() {
  }

  markForCheck = () => {
    this._changeDetectorRef.markForCheck();
  }

  get isIce() {
    return this.formValue['isIce'];
  }

  get isIceEnabled() {
    return this.formValue.type === OrderType.Limit;
  }

  get iceAmount() {
    return this.formValue.iceQuantity;
  }

  toggleIce() {
    const { isIce } = this.formValue as any;
    this.form.patchValue({
      isIce: !isIce
    });
    this.onTypeUpdated();
  }

  onTypeUpdated() {
    if (!this.isIceEnabled || !this.isIce) {
      this.form.controls.iceQuantity.disable();
    } else {
      this.form.controls.iceQuantity.enable();
    }
  }

  setPositionQuantity() {
    if (this._positionsSum) {
      const quantity = Math.abs(this._positionsSum);
      this.form.patchValue({ quantity });
    }
  }

  getDto() {

    const value = { ...this.form.value };
    const quantity = value.quantity;
    if (!this.isIceEnabled || !this.isIce) {
      delete value.iceQuantity;
    }
    if (value.stopLoss?.stopLoss) {
      value.stopLoss.quantity = quantity;
    } else {
      delete value.stopLoss;
    }

    if (value.takeProfit?.takeProfit) {
      value.takeProfit.quantity = quantity;
    } else {
      delete value.takeProfit;
    }
    return value;
  }
}

export const orderDurations = Object.values(OrderDuration);
export const orderTypes = [
  { label: 'MKT', value: OrderType.Market },
  { label: 'LMT', value: OrderType.Limit },
  { label: 'STP LMT', value: OrderType.StopLimit },
  { label: 'STP MKT', value: OrderType.StopMarket },
];

export enum OcoStep {
  Fist, Second, None
}
