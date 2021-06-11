import { Component, Input } from '@angular/core';

@Component({
  selector: 'select-wrapper',
  templateUrl: './select-wrapper.component.html',
  styleUrls: ['./select-wrapper.component.scss']
})
export class SelectWrapperComponent {
  @Input() options = [];
  value;
}
