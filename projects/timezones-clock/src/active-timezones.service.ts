import { Injectable } from "@angular/core";
import { SettingsService } from "../../settings/src";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { ITimezone, Timezone } from "./timezones";

@Injectable()
export class ActiveTimezonesService {
  private _timezones: ITimezone[] = [];
  public timezones$: Observable<ITimezone[]>;

  get enabledTimezone(): ITimezone {
    return this._timezones.find(i => i.enabled);
  }

  constructor(private _settingsService: SettingsService) {

    this.timezones$ = this._settingsService.settings.pipe(
      map(settings => settings.timezones),
      tap(timezones => this._timezones = timezones),
    )
  }

  add(timezone: ITimezone): void {
    const alreadyExist = this._timezones.some(i => i.id === timezone.id);
    if (!alreadyExist) {
      this._timezones.push({ ...timezone });
      this._save();
    }
  }

  rename(timezone: ITimezone, name: string): void {
    timezone.name = name;
    this._save();
  }

  toggleEnabled(timezone: ITimezone, enabled: boolean): void {
    this._timezones.forEach(i => i.enabled = false);
    timezone.enabled = enabled;
    this._save();
  }

  resetItem(timezone: ITimezone): void {
    Timezone.setDefaultProperties(timezone);
    this._save();
  }

  delete(timezone: ITimezone): void {
    this._timezones = this._timezones.filter(i => i.id !== timezone.id);
    this._save();
  }

  deleteAll(): void {
    this._timezones = [];
    this._save();
  }

  private _save(): void {
    this._settingsService.saveTimezones(this._timezones);
  }
}
