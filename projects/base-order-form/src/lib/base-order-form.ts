import { FormComponent } from 'base-components';
import { IOrder, OrderType } from 'trading';
import { IPosition, PositionsRepository } from 'trading';
import { untilDestroyed } from '@ngneat/until-destroy';
import { OrderDuration } from 'trading';

export abstract class BaseOrderForm extends FormComponent<IOrder> {
  protected positionsRepository: PositionsRepository;
  protected accountId;
  protected instrument;
  positions: IPosition[] = [];
  isPositionsNegative: boolean;

  get positionSum() {
    if (!this.instrument) {
      return '-';
    }
    const posSum = this.positions.filter(item => item.instrument.symbol === this.instrument.symbol)
      .reduce((total: number, item) => {
        return (item.buyVolume - item.sellVolume) + (total || 0);
      }, null);
    this.isPositionsNegative = posSum < 0;
    return posSum != null ? posSum : '-';
  }

  loadPositions() {
    this.positionsRepository.getItems({ accountId: this.accountId })
      .pipe(untilDestroyed(this)).subscribe(res => this.positions = res.data);
  }

  get isIce() {
    return this.formValue['isIce'];
  }

  get isIceEnabled() {
    return this.formValue.type === OrderType.Limit;
  }

  get iceAmount() {
    return this.formValue['iceQuantity'];
  }

  toggleIce() {
    const { isIce } = this.formValue as any;
    this.form.patchValue({
      isIce: !isIce
    });
    this.updateIceQuantityState();
  }

  updateIceQuantityState(){
    if (!this.isIceEnabled || !this.isIce) {
      this.form.controls.iceQuantity.disable();
    }
    else {
      this.form.controls.iceQuantity.enable();
    }
  }

  getDto() {

    const value = { ...this.form.value };
    const quantity = value.quantity;
    if (!this.isIceEnabled || !this.isIce) {
      delete value.iceQuantity;
    }
    if (value.stopLoss?.stopLoss) {
      const { ticks } = value.stopLoss;
      value.stopLoss = { quantity, ticks };
    } else {
      delete value.stopLoss;
    }

    if (value.takeProfit?.takeProfit) {
      const { ticks } = value.takeProfit;
      value.takeProfit = { quantity, ticks };
    } else {
      delete value.takeProfit;
    }
    return value;
  }
}
export const orderDurations = Object.values(OrderDuration);
export const orderTypes = [
  // { label: 'MKT', value: OrderType.Market },
  { label: 'LMT', value: OrderType.Limit },
  { label: 'STP LMT', value: OrderType.StopLimit },
  { label: 'STP MKT', value: OrderType.StopMarket },
];
