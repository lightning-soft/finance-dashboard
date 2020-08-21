import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import { IPosition, PositionsRepository} from 'communication';

declare type Operation = 'sell' | 'buy';

@UntilDestroy()
@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent {
  form: FormGroup;
  positions = [] as IPosition[];

  constructor(fb: FormBuilder, positionsRepository: PositionsRepository) {
    this.form = fb.group(
      {
        volume: fb.control(0.1, Validators.min(0.1)),
        operation: fb.control(null, Validators.required)
      }
    );
    positionsRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(items => this.positions = items);
  }

  get longPositions() {
    return this.positions.filter(position => position.isLong);
  }

  get shortPositions() {
    return this.positions.filter(position => !position.isLong);
  }

  addVolume(value) {
    const result = +(value + this.volume).toFixed(1);
    if (result >= 0.1) {
      this.form.patchValue({
        volume: result
      });
    }
  }

  trackByFn(item) {
    return item.id;
  }

  get volume() {
    return this.form.value.volume;
  }

  apply(operation: Operation) {
    this.form.patchValue({operation});
  }

  deleteOrder(order: IPosition) {
    this.positions = this.positions.filter(item => item.id !== order.id);
  }

  deleteAll(isLong: boolean) {
    this.positions = this.positions.filter(item => item.isLong !== isLong);
  }
}
