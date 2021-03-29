import { Component, Input } from "@angular/core";
import { ITimezone, Timezone, TIMEZONES } from "../timezones";
import { SettingsService } from "settings";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { TimezonesService } from "../timezones.service";

@UntilDestroy()
@Component({
  selector: 'app-add-timezone-modal',
  templateUrl: 'add-timezone-modal.component.html',
  styleUrls: ['add-timezone-modal.component.scss'],
})
export class AddTimezoneModalComponent {
  allTimezones: ITimezone[] = [];
  selectedTimezone: ITimezone;
  @Input() currentTimezones: ITimezone[] = [];

  constructor(private _activeTimezonesService: TimezonesService,
              private settingsService: SettingsService) {

    this.allTimezones = TIMEZONES.map(i => new Timezone(i));

    this.settingsService.settings
      .pipe(untilDestroyed(this))
      .subscribe((settings) => {
        this.currentTimezones = settings.timezones;
      })
  }

  addToCurrent(timezone: ITimezone): void {
    this._activeTimezonesService.add(timezone);
  }

  deleteTimezone(timezone: ITimezone): void {
    this._activeTimezonesService.delete(timezone);
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

  moveSelectedTimezoneToCurrent(): void {
    this._activeTimezonesService.add(this.selectedTimezone);
  }

  deleteSelectedTimezoneFromCurrent(): void {
    this._activeTimezonesService.delete(this.selectedTimezone);
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
