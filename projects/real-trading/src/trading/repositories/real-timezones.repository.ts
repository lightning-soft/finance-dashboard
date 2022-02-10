import { Injectable } from '@angular/core';
import { ITimezone, TIMEZONES } from 'trading';
import { BaseRepository } from './base-repository';
import { Observable, of } from 'rxjs';
import { IPaginationResponse } from 'communication';

const data = TIMEZONES.map(item => {
  const offset = ((moment as any).tz(item.utc[0])._offset / 60);
  return {
    name: `(UTC ${ getFormattedOffset(offset) }) ${ item.text }`,
    id: item.utc[0],
    offset,
    utcMap: item.utc.reduce((total, curr) => {
      total[curr] = true;
      return total;
    }, {})
  };
}).sort((a, b) => a.offset - b.offset);

@Injectable()
export class RealTimezonesRepository extends BaseRepository<ITimezone> {
  protected get suffix(): string {
    return 'TradingSessions/TimeZones';
  }

  protected get _baseUrl(): string {
    return this._communicationConfig.zoneDecoder.http.url + this.suffix;
  }

  getItems(params?: any): Observable<IPaginationResponse<ITimezone>> {

    return of({
      data,
      total: data.length,
      requestParams: {
        skip: 0,
        take: data.length,
      }
    } as IPaginationResponse);
    /* return super.getItems(params)
       .pipe(map((res) => {
         res.data = res.data.sort((a, b) => a.offset - b.offset);
         return res;
       }));*/
  }
}

function getFormattedOffset(offset) {
  const result = offset % 1;
  const suffix = result === 0 ? '00' : `${ Math.abs(result) * 60 }`;
  const preparedOffset = Math.floor(Math.abs(offset));
  let response = `${ Math.abs(preparedOffset) }:${ suffix }`;
  if (offset > -10 && offset < 10)
    response = `0${ response }`;
  if (offset >= 0)
    response = `+${ response }`;
  else
    response = `-${ response }`;
  return response;
}
