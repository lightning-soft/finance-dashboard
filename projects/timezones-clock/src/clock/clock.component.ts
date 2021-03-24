import { Component, OnInit } from '@angular/core';
import { NzModalService } from "ng-zorro-antd";
import { AddTimezoneModalComponent } from "../add-timezone-modal/add-timezone-modal.component";
import { ActiveTimezonesService } from "../active-timezones.service";
import { ITimezone, Timezone, TIMEZONES } from "../timezones";

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit {
  time: number;
  timezones: ITimezone[] = [];
  localTimezone: ITimezone;
  enabledTimezone: ITimezone;

  constructor(private modalService: NzModalService,
              private timezonesService: ActiveTimezonesService) {
    setInterval(() => {
      this.time = Date.now();
    }, 1000);
  }

  ngOnInit(): void {
    this.timezonesService.timezones$.subscribe((timezones) => {
      this.timezones = timezones;
      this.enabledTimezone = this.timezonesService.enabledTimezone;
    })

    this.localTimezone = this._getLocalTimezone();
  }

  addTimezone(): void {
    this.modalService.create({
      nzContent: AddTimezoneModalComponent,
      nzWrapClassName: 'timezones-modal vertical-center-modal',
      nzFooter: null
    });
  }

  deleteTimezone(timezone: ITimezone): void {
    this.timezonesService.delete(timezone);
  }

  updateTimezoneName(timezone: ITimezone, name: string): void {
    this.timezonesService.rename(timezone, name);
  }

  toggleTimezone(timezone: ITimezone, enabled: boolean): void {
    this.timezonesService.toggleEnabled(timezone, enabled);
  }

  resetTimezone(timezone: ITimezone): void {
    this.timezonesService.resetItem(timezone);
  }

  private _getLocalTimezone(): ITimezone {
    const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const foundTimezones = TIMEZONES.filter(timezone => {
      return timezone.utc.some(i => i === timezoneName);
    })

    const supposedTimezone = (foundTimezones || []).reduce((acc, item) => {
      return item.utc.length < acc?.utc.length ? item : acc;
    });

    return supposedTimezone ? new Timezone(supposedTimezone) : null;
  }
}
