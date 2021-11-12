import { Injectable } from '@angular/core';
import { ITimezone } from 'trading';
import { BaseRepository } from './base-repository';
import { IANA_ALIAS_MAP } from 'windows-iana';

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

  protected _mapResponseItem(item: any): ITimezone {
    const { id, standardName } = item;
    const name = `(${standardName}) ` + timeZoneMap[item.id];
    return {
      id,
      name,
    };
  }
}
