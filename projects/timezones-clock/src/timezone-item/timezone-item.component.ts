import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITimezone } from "../timezones";

@Component({
    selector: 'timezone-item',
    templateUrl: 'timezone-item.component.html',
    styleUrls: ['timezone-item.component.scss']
})
export class TimezoneItemComponent {
  editing = false;

  @Input() timezone: ITimezone;
  @Input() editable = true;
  @Input() canToggle = true;

  @Output() reset = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggleEnabled = new EventEmitter<boolean>();
  @Output() rename = new EventEmitter<string>();

  handleInputBlur(inputValue: string): void {
    this.editing = false;

    if (inputValue) {
      this.rename.emit(inputValue);
    }
  }
}
