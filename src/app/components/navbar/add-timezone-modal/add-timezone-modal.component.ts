import {Component, Input} from "@angular/core";
import {ITimezone, TIMEZONES} from "./timezones";
import {UtcPipe} from "./utc.pipe";

interface ICurrentTimezone extends ITimezone {
  name: string;
  editing: boolean;
  enabled: boolean;
}

@Component({
  selector: 'app-add-timezone-modal',
  templateUrl: 'add-timezone-modal.component.html',
  styleUrls: ['add-timezone-modal.component.scss'],
  providers: [UtcPipe]
})
export class AddTimezoneModalComponent {
  readonly allTimezones: ITimezone[] = TIMEZONES;
  @Input() currentTimezones: ICurrentTimezone[] = [];

  constructor(private utcPipe: UtcPipe) {
  }

  addToCurrent(timezone: ITimezone): void {
    this.currentTimezones.push({
      ...timezone,
      name: this.utcPipe.transform(timezone.offset),
      editing: false,
      enabled: true,
    });
  }

  deleteFromCurrent(timezone: ICurrentTimezone): void {
    this.currentTimezones = this.currentTimezones.filter(i => i.abbr !== timezone.abbr);
  }

  updateTimezoneName(timezone: ICurrentTimezone, name: string): void {
    timezone.name = name;
    timezone.editing = false;
  }

  toggleCurrentTimezone(timezone: ICurrentTimezone, enabled: boolean): void {
    timezone.enabled = enabled;
  }

  resetTimezone(timezone: ICurrentTimezone): void {

  }
}
