import { Component, Input } from "@angular/core";
import { ITimezone, TIMEZONES } from "./timezones";

@Component({
  selector: 'app-add-timezone-modal',
  templateUrl: 'add-timezone-modal.component.html',
  styleUrls: ['add-timezone-modal.component.scss'],
})
export class AddTimezoneModalComponent {
  readonly allTimezones: ITimezone[] = TIMEZONES;
  @Input() currentTimezones: ITimezone[];
}
