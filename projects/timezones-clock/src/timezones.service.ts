import { Injectable } from "@angular/core";
import { SettingsService } from "../../settings/src";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { ITimezone, Timezone } from "./timezones";

interface ITimezonesData {
  localTimezoneTitle: string;
  timezones: ITimezone[];
}

@Injectable()
export class TimezonesService {
  private _timezones: ITimezone[] = [];
  private _canEnableTimezone: boolean;
  public timezonesData$: Observable<ITimezonesData>;
  public localTimezoneTitle: string;
  public maxEnabledTimezonesCount: number;

  get enabledTimezones(): ITimezone[] {
    return this._timezones.filter(i => i.enabled);
  }

  get canEnableTimezone(): boolean {
    return this._canEnableTimezone;
  }

  constructor(private _settingsService: SettingsService) {

    this.timezonesData$ = this._settingsService.settings.pipe(
      map(settings => ({ localTimezoneTitle: settings.localTimezoneTitle, timezones: settings.timezones })),
      tap(data => {
        this._timezones = data.timezones;
        this.localTimezoneTitle = data.localTimezoneTitle;
        this._canEnableTimezone = this.maxEnabledTimezonesCount == null || this.enabledTimezones.length < this.maxEnabledTimezonesCount;
      }),
    );
  }

  add(timezone: ITimezone): void {
    const alreadyExist = this._timezones.some(i => i.id === timezone.id);
    if (!alreadyExist) {
      this._timezones.push({ ...timezone });
      this._save();
    }
  }

  rename(timezone: ITimezone, name: string): void {
    this._updateItem({ ...timezone, name });
  }

  toggleEnabled(timezone: ITimezone, enabled: boolean): void {
    if (!enabled || this.canEnableTimezone) {
      this._updateItem({ ...timezone, enabled });
    }
  }

  resetItem(timezone: ITimezone): void {
    this._updateItem({ ...timezone, name: Timezone.getDefaultName(timezone) });
  }

  delete(timezone: ITimezone): void {
    this._timezones = this._timezones.filter(i => i.id !== timezone.id);
    this._save();
  }

  deleteAll(): void {
    this._timezones = [];
    this._save();
  }

  changeLocalTitle(title: string): void {
    this._settingsService.saveLocalTimezoneTitle(title);
  }

  resetLocalTitle(): void {
    this._settingsService.saveLocalTimezoneTitle('Local');
  }

  private _save(): void {
    this._settingsService.saveTimezones(this._timezones);
  }

  private _updateItem(timezone: ITimezone, save = true): void {
    const index = this._timezones.findIndex(i => i.id === timezone.id);
    this._timezones[index] = timezone;

    if (save) {
      this._save();
    }
  }
}
