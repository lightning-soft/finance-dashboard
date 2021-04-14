import { Component, Input } from "@angular/core";
import { ITimezone, Timezone, TIMEZONES } from "../timezones";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TimezonesService } from "../timezones.service";
import { animate, style, transition, trigger } from "@angular/animations";

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

  constructor(private _activeTimezonesService: TimezonesService) {

    this.allTimezones = TIMEZONES
      .map(i => new Timezone(i))
      .sort((a, b) => a.offset < b.offset ? 1 : -1);

    this._activeTimezonesService.timezonesData$
      .pipe(untilDestroyed(this))
      .subscribe((settings) => {
        this.currentTimezones = settings.timezones;
      });
  }

  addToCurrent(timezone: ITimezone): void {
    this.showMaxSizeError = this.currentTimezones.length >= this.maxCurrentTimezonesSize;

    if (!this.showMaxSizeError) {
      this._activeTimezonesService.add(timezone);
    }
  }

  deleteTimezone(timezone: ITimezone): void {
    this._activeTimezonesService.delete(timezone);
    this.showMaxSizeError = false;
  }

  updateTimezoneName(timezone: ITimezone, name: string): void {
    this._activeTimezonesService.rename(timezone, name);
  }

  toggleTimezone(timezone: ITimezone, enabled: boolean): void {
    this._activeTimezonesService.toggleEnabled(timezone, enabled);
  }

  resetTimezone(timezone: ITimezone): void {
    this._activeTimezonesService.resetItem(timezone);
  }

  resetTimezones(): void {
    this._activeTimezonesService.deleteAll();
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
