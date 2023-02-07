import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { getColor } from '../fields';
import { FormControl, FormGroup } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'data-box',
  templateUrl: './data-box.component.html',
  styleUrls: ['./data-box.component.scss']
})
@UntilDestroy()
export class DataBoxComponent extends FieldType implements AfterViewInit {
  formBox = new FormGroup({
    delta: new FormGroup({
      enabled: new FormControl(),
      order: new FormControl(),
      positiveTextColor: new FormControl(),
      negativeTextColor: new FormControl(),
    }),
    volume: new FormGroup({
      enabled: new FormControl(),
      order: new FormControl(),
    }),
    price: new FormGroup({
      enabled: new FormControl(),
      order: new FormControl(),
    }),
    priceChange: new FormGroup({
      enabled: new FormControl(),
      order: new FormControl(),
      unit: new FormControl(),
    }),
  });

  negativeColor = {
    ...getColor('Negative'),
    formControl: this.formBox.get('delta.negativeTextColor')
  };

  positiveColor = {
    ...getColor('Positive'),
    formControl: this.formBox.get('delta.positiveTextColor')
  };

  @ViewChild('delta') delta;
  @ViewChild('volume') volume;
  @ViewChild('price') price;
  @ViewChild('priceChange') priceChange;

  items = [];

  ngAfterViewInit() {
    const value = this.formControl.value;

    if (value) {
      this.formBox.patchValue(value, { emitEvent: false });
    }

    this._setTemplates();

    this.formBox.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((res) => this.formControl.patchValue(res));
  }

  entered($event: CdkDragDrop<any, any>) {
    const { previousIndex, currentIndex } = $event;

    const temp = this.items[previousIndex];
    this.items[previousIndex] = this.items[currentIndex];
    this.items[currentIndex] = temp;

    Object.keys(this.formBox.value).forEach(key => {
      const index = this.items.findIndex(i => i.key === key);

      this.formBox.get(`${key}.order`).setValue(index + 1);
    });
  }

  private _setTemplates() {
    const map = {
      delta: this.delta,
      volume: this.volume,
      price: this.price,
      priceChange: this.priceChange
    };

    this.items = Object.entries(this.formBox.value)
      .sort((a: any, b: any) => a[1].order - b[1].order)
      .map(([key]) => ({
        key,
        template: map[key],
      }));
  }
}
