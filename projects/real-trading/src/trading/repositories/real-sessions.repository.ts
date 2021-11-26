import { Injectable } from '@angular/core';
import { ISession } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealSessionsRepository extends BaseRepository<ISession> {
  protected get suffix(): string {
    return 'TradingSessions';
  }

  protected get _baseUrl(): string {
    return this._communicationConfig.zoneDecoder.http.url + this.suffix;
  }

  protected _mapResponseItem(item: any): ISession {
    return {
      id: item.id,
      name: item.name,
      exchange: item.exchange,
      timezoneId: item.timezoneId,
      workingTimes: item.workingTimes.map((i: any) => ({
        startDay: i.startDay,
        startTime: i.startTime,
        endDay: i.endDay,
        endTime: i.endTime,
      })),
    };
  }

  protected _responseToItems(res: any, params: any) {
    return super._responseToItems(res, params)
      .sort((a, b) => {
        if (a.name > b.name)
          return 1;
        else if (a.name < b.name)
          return -1;
        return 0;
      });
  }
}
