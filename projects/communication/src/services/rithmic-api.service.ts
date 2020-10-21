import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import queryString from 'query-string';
import { IInstrument } from 'trading';
import { IPaginationResponse } from '../common';

@Injectable({
  providedIn: 'root',
})
export class RithmicApiService {
  private _apiUrl = 'https://rithmic.avidi.tech/api/';

  constructor(private _httpClient: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = {
      username,
      password,
    };

    return this._httpClient.post(`${this._apiUrl}Connection`, body);
  }

  logout(): Observable<any> {
    return this._httpClient.post(`${this._apiUrl}Connection/logout`, {});
  }

  getInstrument(id: string): Observable<IInstrument> {
    return this._httpClient.get(`${this._apiUrl}Instrument/${id}`).pipe(
      map((res: any) => res.result),
    );
  }

  getInstruments(criteria = 'ES'): Observable<IPaginationResponse<IInstrument>> {
    return this._httpClient.get(`${this._apiUrl}Instrument?criteria=${criteria}`).pipe(
      map((res: any) => {
        const data = res.result.map(({ symbol, exchange }) => ({
          id: symbol,
          name: symbol,
          exchange,
          tickSize: 0.01,
        }));

        return { data } as IPaginationResponse<IInstrument>;
      }),
    );
  }

  getHistory(symbol: string, params: any): Observable<IPaginationResponse<any>> {
    const _params = queryString.stringify(params);

    return this._httpClient.get(`${this._apiUrl}History/${symbol}?${_params}`).pipe(
      map((res: any) => {
        const data = res.result.map(item => ({
          date: moment.utc(item.timestamp).toDate(),
          open: item.openPrice,
          close: item.closePrice,
          high: item.highPrice,
          low: item.lowPrice,
          volume: item.volume,
        }));

        return { data } as IPaginationResponse<any>;
      }),
    );
  }
}
