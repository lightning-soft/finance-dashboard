import { FormComponent } from 'base-components';
import { IOrder } from 'trading';
import { IPosition, PositionsRepository } from 'trading';
import { untilDestroyed } from '@ngneat/until-destroy';

export abstract class BaseOrderForm extends FormComponent<IOrder> {
  protected positionsRepository: PositionsRepository;
  protected accountId;
  protected instrument;
  positions: IPosition[] = [];
  isPositionsNegative: boolean;

  get positionSum() {
    if (!this.instrument){
      return '-';
    }
    const posSum = this.positions.filter(item => item.instrument.symbol === this.instrument.symbol)
      .reduce((total: number, item ) => {
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

  get iceAmount() {
    return this.formValue['iceAmount'];
  }

  toggleIce() {
    const { isIce } = this.formValue as any;
    this.form.patchValue({
      isIce: !isIce
    });
  }

  getDto() {

    const value = { ...this.form.value };
    const quantity = value.quantity;
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
