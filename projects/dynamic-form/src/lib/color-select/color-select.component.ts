import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl, FormGroup } from '@angular/forms';
import { getColor } from '../fields';

@Component({
  selector: 'lib-color-select',
  templateUrl: './color-select.component.html',
  styleUrls: ['./color-select.component.scss']
})
export class ColorSelectComponent extends FieldType implements OnInit {
  colorForm = new FormGroup({});
  colorFormFields;

  ngOnInit() {
    this.colorFormFields = (this.field.templateOptions.options as any).reduce((total, current) => {
      this.colorForm.addControl(current.value.type, new FormControl(current.value.value));
      total[current.value.type] = {
        ...getColor(current.value.type),
        formControl: this.colorForm.controls[current.value.type],
      };
      return total;
    }, {});

    const option = (this.field.templateOptions.options as any).find(option => option.value.type == this.field.model.color.type);
    if (option)
      option.value.value = this.field.model.color.value;

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
}
