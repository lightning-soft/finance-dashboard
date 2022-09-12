import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {map, tap} from "rxjs/operators";
import {SettingsService} from "settings";
import {ITimezone, Timezone} from "./timezones";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "environment";
import * as clone from 'lodash.clonedeep';

interface ITimezonesData {
  localTimezoneTitle: string;
  timezones: ITimezone[];
}

interface IWorldTimeInfo {
  abbreviation: string;
  client_ip: string;
  datetime: Date;
  day_of_week: number;
  day_of_year: number;
  dst: boolean;
  dst_from: Date;
  dst_offset: number;
  dst_until: Date;
  raw_offset: number;
  timezone: string;
  unixtime: number;
  utc_datetime: Date;
  utc_offset: string;
  week_number: number;
}

@UntilDestroy()
@Injectable()
export class TimezonesService {
  private _timezones: ITimezone[] = [];
  private _canEnableTimezone: boolean;
  public timezonesData$: Observable<ITimezonesData>;
  public localTimezoneTitle: string;
  public maxEnabledTimezonesCount: number;

  get enabledTimezones(): ITimezone[] {
    return this._checkUTCTimeZone(this._timezones.filter(i => i.enabled));
  }

  get canEnableTimezone(): boolean {
    return this._canEnableTimezone;
  }

  constructor(private _settingsService: SettingsService, private http: HttpClient) {

    this.timezonesData$ = this._settingsService.settings.pipe(
      map(settings => ({localTimezoneTitle: settings.localTimezoneTitle, timezones: settings.timezones})),
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
      this._timezones.push({...timezone});
      this._save();
    }
  }

  rename(timezone: ITimezone, name: string): void {
    this._updateItem({...timezone, name});
  }

  toggleEnabled(timezone: ITimezone, enabled: boolean): void {
    for (const item of this._timezones) {
      item.enabled = item.id === timezone.id && enabled;
    }

    this._save();
  }

  resetItem(timezone: ITimezone): void {
    this._updateItem({...timezone, name: Timezone.getDefaultName(timezone)});
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

  private _checkUTCTimeZone(timezones: ITimezone[]): ITimezone[] {
    const newTimeZone = clone(timezones);
    const getUTCZone = newTimeZone[0]?.utc[0];

    if (getUTCZone) {
      this.getTimeZoneInfo(getUTCZone).pipe(untilDestroyed(this)).subscribe((val) => {
        const newOffset: number = +val?.utc_offset.split(':')[0];
        const integer: number = Math.trunc(newOffset);
        const minutes: number = this.getMinutesFromOffset(newOffset);
        newTimeZone[0].offset = newOffset;
        newTimeZone[0].name = `UTC${newOffset >= 0 ? '+' : ''}${integer}:${minutes ? minutes : '00'}`;
      });
    }


    return newTimeZone;

  }

  private getTimeZoneInfo(timezone: string): Observable<IWorldTimeInfo> {
    const basePath: string = environment.timezone;
    const httpOptions: { headers: HttpHeaders } = {headers: new HttpHeaders({'Access-Control-Allow-Origin': '*'})};
    return this.http.get<IWorldTimeInfo>(
      `${basePath}/${timezone}`, httpOptions);

  }

  private getMinutesFromOffset(offset: number): number {
    const decimal = offset.toFixed(2).split('.')[1];
    return +decimal * 60 / 100;
  }
}
