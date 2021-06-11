import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { generateKeyFromLabel } from '../fields';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

export const noneValue = 'none';
const noneOption = { label: 'None', value: noneValue };

@Component({
  selector: 'column-selector',
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
@UntilDestroy()
export class ColumnSelectorComponent extends FieldWrapper implements OnInit, AfterViewInit {
  checkboxMainOptions = [];
  secondaryOptions = [];
  data = {};
  availableOptions = [];
  nodeValue = noneValue;
  allowDisable = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.checkboxMainOptions = this.field.templateOptions.columns.map(transformOptions('key'));
    this.secondaryOptions = this.field.templateOptions.secondaryOptions.map(transformOptions('value'));

    this._enableDataItemsIfNeeded(this.formControl.root.value);

    this.formControl.root.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(item => {
        this._enableDataItemsIfNeeded(item);
      });

    this.secondaryOptions.unshift(noneOption);
    this.data = this.formControl.value ?? {};

    this.formControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.data = res;
      });

    this.availableOptions = this.secondaryOptions;
    this.checkboxMainOptions.forEach(item => {
      if (!this.data[item.key])
        this.data[item.key] = {};
    });
  }

  _enableDataItemsIfNeeded(item: any) {
    this.allowDisable = item.display.showOrders;
    if (item.display.showOrders) {
      for (let key in this.data) {
        if (this.data[key].pair !== noneValue) {
          this.data[key].enabled = true;
        }
      }
    }
  }

  ngAfterViewInit() {
    this.updateAvailable();
  }

  onItemChanged(item) {
    this.updateEnabled(this.data[item.key]);
    this.updateValue();
    this.updateAvailable();
  }

  updateValue() {
    this.formControl.patchValue(this.data);
  }

  showAllAvailable() {
    this.availableOptions = this.secondaryOptions;
  }

  updateAvailable() {
    const takenKeys = Object.values(this.data).map((item: any) => item.pair).filter(item => item !== noneValue);
    this.availableOptions = this.secondaryOptions.filter(item => {
      return !item.value || !takenKeys.includes(item.value);
    });
  }

  updateEnabled(data: any) {
    if (data.pair != noneValue)
      data.enabled = true;
  }

  entered($event) {
    const previousIndex = $event.container.data;
    const currentIndex = $event.item.data;
    const prevKey = this.checkboxMainOptions[previousIndex].key;
    const currentKey = this.checkboxMainOptions[currentIndex].key;

    const prevPair = this.data[prevKey].pair;
    const currPair = this.data[currentKey].pair;

    this.data[prevKey].pair = currPair;
    this.data[currentKey].pair = prevPair;

    this.showAllAvailable();
    this.updateValue();
    setTimeout(() => this.updateAvailable());
  }
}

export function transformOptions(key) {
  return (item) => {
    if ('string' === typeof item) {
      return { [key]: generateKeyFromLabel(item), label: item };
    }
    return item;
  };
}
