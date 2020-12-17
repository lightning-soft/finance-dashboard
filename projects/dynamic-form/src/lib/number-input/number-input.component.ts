import { Component } from '@angular/core';
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: 'number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent extends FieldType {
}
