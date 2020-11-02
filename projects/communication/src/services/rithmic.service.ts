import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import queryString from 'query-string';
import { IInstrument } from 'trading';
import { IPaginationResponse } from '../common';
import { Broker } from './broker';

declare const moment: any;

@Injectable({
  providedIn: 'root',
})
export class RithmicService extends Broker {
  protected _getKey(): string {
    return 'rithmic';
  }

  connect(username: string, password: string): Observable<any> {
    const body = {
      username,
      password,
    };

    return this._httpClient.post(`${this._apiUrl}Connection`, body).pipe(
      tap((res) => {
        this._apiKey = res.result.apiKey;

        this._handleConnection(true);
      }),
    );
  }

  disconnect(): Observable<any> {
    return this._httpClient.post(`${this._apiUrl}Connection/logout`, {}, this._httpOptions).pipe(
      tap(() => {
        this._apiKey = null;

        this._handleConnection(false);
      }),
    );
  }

  getInstrument(id: string): Observable<IInstrument> {
    return this._httpClient.get(`${this._apiUrl}Instrument/${id}`, this._httpOptions).pipe(
      map((res: any) => res.result),
    );
  }

  getInstruments(criteria = 'ES'): Observable<IPaginationResponse<IInstrument>> {
    return this._httpClient.get(`${this._apiUrl}Instrument?criteria=${criteria}`, this._httpOptions).pipe(
      map((res: any) => {
        const data = res.result.map(({ symbol, exchange }) => ({
          id: symbol,
          symbol,
          exchange,
          tickSize: 0.01,
        }));

        return { data } as IPaginationResponse<IInstrument>;
      }),
    );
  }

  getHistory(symbol: string, params: any): Observable<IPaginationResponse<any>> {
    const _params = queryString.stringify(params);

    return this._httpClient.get(`${this._apiUrl}History/${symbol}?${_params}`, this._httpOptions).pipe(
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
