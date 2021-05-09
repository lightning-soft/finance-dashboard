import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { ITimezone } from "../timezones";

@Component({
  selector: 'timezone-item',
  templateUrl: 'timezone-item.component.html',
  styleUrls: ['timezone-item.component.scss']
})
export class TimezoneItemComponent {
  editing = false;

  @Input() @HostBinding('class.editable') editable = true;
  @Input() showCheckbox = true;
  @Input() checkboxDisabled = false;
  @Input() canDelete = true;
  @Input() timezone: ITimezone;
  @Input() subtitleFontSize = 10;

  @Output() reset = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() checkbox = new EventEmitter<boolean>();
  @Output() rename = new EventEmitter<string>();

  handleInputBlur(inputValue: string): void {
    this.editing = false;

    if (inputValue) {
      this.rename.emit(inputValue);
    }
  }
}
