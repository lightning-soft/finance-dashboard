import { Component, Input } from '@angular/core';
import { ITimezone, Timezone } from '../timezones';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TimezonesService } from '../timezones.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { TIMEZONES } from 'trading';

const EnterAnimation = trigger(
  'enterAnimation', [
    transition(':enter', [
      style({opacity: 0}),
      animate('200ms', style({opacity: 1}))
    ]),
  ]
);

@UntilDestroy()
@Component({
  selector: 'app-add-timezone-modal',
  templateUrl: 'add-timezone-modal.component.html',
  styleUrls: ['add-timezone-modal.component.scss'],
  animations: [EnterAnimation]
})
export class AddTimezoneModalComponent {
  @Input() currentTimezones: ITimezone[] = [];
  readonly maxCurrentTimezonesSize = 10;
  allTimezones: ITimezone[] = [];
  selectedTimezone: ITimezone;
  showMaxSizeError = false;

  get canEnableTimezone(): boolean {
    return this.timezonesService.canEnableTimezone;
  }

  constructor(private timezonesService: TimezonesService) {
    this.allTimezones = TIMEZONES
      .sort((a, b) => a.offset < b.offset ? 1 : -1)
      .map((i: any) => new Timezone(i));

    this.timezonesService.timezonesData$
      .pipe(untilDestroyed(this))
      .subscribe((settings) => {
        this.currentTimezones = settings.timezones;
      });
  }

  addToCurrent(timezone: ITimezone): void {
    this.showMaxSizeError = this.currentTimezones.length >= this.maxCurrentTimezonesSize;

    if (!this.showMaxSizeError) {
      this.timezonesService.add(timezone);
    }
  }

  deleteTimezone(timezone: ITimezone): void {
    this.timezonesService.delete(timezone);
    this.showMaxSizeError = false;
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

  resetTimezones(): void {
    this.timezonesService.deleteAll();
  }

  isTimezoneDisabled(timezone: ITimezone): boolean {
    return this.currentTimezones.some(i => i.id === timezone.id);
  }

  handleTimezoneClick(timezone: ITimezone): void {
    if (!this.isTimezoneDisabled(timezone)) {
      this.selectedTimezone = timezone;
    }
  }
}
