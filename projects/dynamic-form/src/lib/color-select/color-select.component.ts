import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl, FormGroup } from '@angular/forms';
import { getColor } from '../fields';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { take } from 'rxjs/operators';

@Component({
  selector: 'lib-color-select',
  templateUrl: './color-select.component.html',
  styleUrls: ['./color-select.component.scss']
})
@UntilDestroy()
export class ColorSelectComponent extends FieldType implements OnInit {
  colorForm = new FormGroup({
    profileColor: new FormControl('#0C62F7'),
    customBlend: new FormGroup({
      highColor: new FormControl('#0C62F7'),
      lowColor: new FormControl('rgba(201, 59, 59, 1)'),
    }),
    fpShading: new FormGroup({
      buyColor: new FormControl('#0033E9'),
      sellColor: new FormControl('#BC0606'),
    }),
  });
  map = { profileColor: 'profileColor', heatMap: 'heatMap', customBlend: 'customBlend', fpShading: 'fpShading' };
  nameMap = {
    profileColor: 'Profile Color',
    heatMap: 'Heat Map',
    customBlend: 'Custom Blend',
    fpShading: 'FP Shading'
  };
  currentType = 'profileColor';
  visible = false;
  colorFormFields = {
    profileColor: { ...getColor('profileColor'), formControl: this.colorForm.get('profileColor') },
    customBlendHigh: {
      ...getColor('customBlendHigh'),
      formControl: this.colorForm.get('customBlend').get('highColor')
    },
    customBlendLow: {
      ...getColor('customBlendLow'),
      formControl: this.colorForm.get('customBlend').get('lowColor')
    },
    fpShadingBuy: {
      ...getColor('fpShadingBuy'),
      formControl: this.colorForm.get('fpShading').get('buyColor')
    },
    fpShadingSell: {
      ...getColor('fpShadingSell'),
      formControl: this.colorForm.get('fpShading').get('sellColor')
    }
  };

  ngOnInit() {
    if (this.field.model.color) {
      const { type, value } = this.field.model.color.value;
      this.colorForm.patchValue({ type, value });
    }
    this.formControl.valueChanges
      .pipe(
        take(1),
        untilDestroyed(this))
      .subscribe((res) => {
        console.log(res);
        this.currentType = res.type;
        const option = (this.field.templateOptions.options as any).find(option => option.value.type == res.type);
        const value = res.value;
        if (option)
          option.value.value = value;
        this.formControl.patchValue({ value, type: res.type });
        this.colorForm.patchValue({[res.type]: value });
      });
    this.colorForm.valueChanges
      .subscribe((res) => {
        const type = this.formControl.value.type;
        const option = (this.field.templateOptions.options as any).find(option => option.value.type == type);
        const value = res[type];
        if (option)
          option.value.value = value;
        this.formControl.patchValue({ value, type });
      });
  }

  compareItems(a, b) {
    return a?.type === b?.type;
  }

  updateValue($event: string) {
    this.formControl.setValue({
      type: this.formControl.value.type,
      value: $event,
    });
  }

  select(value: string) {
    this.visible = true;
    this.currentType = value;
    this.formControl.patchValue({ type: value, value: this.colorForm.get(value)?.value });
  }
}
