import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'dynamic-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent extends FieldType {
  getIcon(value: any) {
    return (this.field.templateOptions.options as any)
      .find((i) => i.value === value)?.icon;
  }
}
