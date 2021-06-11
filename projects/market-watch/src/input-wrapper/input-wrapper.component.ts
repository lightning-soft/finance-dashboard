import { Component, Input } from '@angular/core';

@Component({
  selector: 'input-wrapper',
  templateUrl: './input-wrapper.component.html',
  styleUrls: ['./input-wrapper.component.scss']
})
export class InputWrapperComponent {
  @Input() value = '';
  @Input() placeholder = '';
}
