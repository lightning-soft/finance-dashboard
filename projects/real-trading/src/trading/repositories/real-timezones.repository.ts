import { Injectable } from '@angular/core';
import { ITimezone } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealTimezonesRepository extends BaseRepository<ITimezone> {
  protected get suffix(): string {
    return 'TradingSessions/TimeZones';
  }

  protected get _baseUrl(): string {
    return this._communicationConfig.zoneDecoder.http.url + this.suffix;
  }

  protected _mapResponseItem(item: any): ITimezone {
    const { id } = item;
    const name = item.displayName.replace(/\s.*$/, ' ') + id;

    return {
      id,
      name,
    };
  }
}
