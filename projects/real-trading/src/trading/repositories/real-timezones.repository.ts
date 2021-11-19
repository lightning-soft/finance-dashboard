import { Injectable } from '@angular/core';
import { ITimezone } from 'trading';
import { BaseRepository } from './base-repository';
import { IANA_ALIAS_MAP } from 'windows-iana';
import { Observable } from 'rxjs';
import { IPaginationResponse } from 'communication';
import { map } from 'rxjs/operators';

const timeZoneMap = IANA_ALIAS_MAP.reduce((total, curr) => {
  curr.alias.forEach((alias) => {
    total[alias] = curr.description;
  });
  return total;
}, {});

@Injectable()
export class RealTimezonesRepository extends BaseRepository<ITimezone> {
  protected get suffix(): string {
    return 'TradingSessions/TimeZones';
  }

  protected get _baseUrl(): string {
    return this._communicationConfig.zoneDecoder.http.url + this.suffix;
  }

  getItems(params?: any): Observable<IPaginationResponse<ITimezone>> {
    return super.getItems(params)
      .pipe(map((res) => {
        res.data = res.data.sort((a, b) => a.offset - b.offset);
        return res;
      }));
  }

  protected _mapResponseItem(item: any): ITimezone {
    const { id, baseUtcOffset } = item;
    const offset = baseUtcOffset.hours;
    const name = `(UTC ${getPrefix(offset)}) ` + timeZoneMap[item.id];
    return {
      id,
      name,
      offset
    };
  }
}

function getPrefix(offset) {
  let response = `${Math.abs(offset)}:00`;
  if (offset > -10 && offset < 10)
    response = `0${response}`;
  if (offset >= 0)
    response = `+${response}`;
  else
    response = `-${response}`;
  return response;
}
