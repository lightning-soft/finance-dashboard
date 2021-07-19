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
  negativeControl = new FormControl();
  positiveControl = new FormControl();
  deltaControl = new FormControl();
  volumeControl = new FormControl();
  priceControl = new FormControl();
  priceChangedControl = new FormControl();
  showInControl = new FormControl();
  dataBoxPlacement = new FormControl();

  formBox = new FormGroup({
    delta: this.deltaControl,
    volume: this.volumeControl,
    price: this.priceControl,
    priceChanged: this.priceChangedControl,
    showIn: this.showInControl,
    dataBoxPlacement: this.dataBoxPlacement,
    negativeDelta: this.negativeControl,
    positiveDelta: this.positiveControl,
  });

  negativeColor = {
    ...getColor('Negative'
    ),
    formControl: this.negativeControl
  };
  positiveColor = {
    ...getColor('Positive'),
    formControl: this.positiveControl
  };

  @ViewChild('delta') delta;
  @ViewChild('volume') volume;
  @ViewChild('price') price;
  @ViewChild('priceChanged') priceChanged;

  types = [];

  ngAfterViewInit() {
    const value = this.formControl.value;
    if (value) {
      this.formBox.patchValue(value, { emitEvent: false });
      const map = { delta: this.delta, volume: this.volume, price: this.price, priceChanged: this.priceChanged };
      this.types = value.dataBoxPlacement.map(item => ({ name: item, template: map[item] }));
    } else {
      this.types = [{ template: this.delta, name: 'delta' }, { template: this.volume, name: 'volume' },
        { template: this.price, name: 'price' }, { template: this.priceChanged, name: 'priceChanged' }];
    }

    this.formBox.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((res) => this.formControl.patchValue(res));
  }

  entered($event: CdkDragDrop<any, any>) {
    const { previousIndex, currentIndex } = $event;
    const temp = this.types[previousIndex];
    this.types[previousIndex] = this.types[currentIndex];
    this.types[currentIndex] = temp;
    this.dataBoxPlacement.patchValue(this.types.map(item => item.name));
  }
}
