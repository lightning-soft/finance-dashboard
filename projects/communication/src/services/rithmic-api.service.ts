import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import queryString from 'query-string';
import { IInstrument } from 'trading';
import { IPaginationResponse } from '../common';

@Injectable({
  providedIn: 'root',
})
export class RithmicApiService {
  connectionSubject: Subject<boolean> = new Subject();

  private _apiUrl = 'https://rithmic.avidi.tech/api/';

  constructor(private _httpClient: HttpClient) {}

  handleConnection(callback: (isConnected: boolean) => void, instance = null): Subscription {
    const isConnected: boolean = !!+localStorage.getItem('isConnected');

    callback(isConnected);

    if (instance) {
      return this.connectionSubject
        .pipe(untilDestroyed(instance))
        .subscribe(callback);
    }

    return this.connectionSubject.subscribe(callback);
  }

  login(username: string, password: string): Observable<any> {
    const body = {
      username,
      password,
    };

    return this._httpClient.post(`${this._apiUrl}Connection`, body).pipe(
      tap(() => this._handleConnection(true)),
    );
  }

  logout(): Observable<any> {
    return this._httpClient.post(`${this._apiUrl}Connection/logout`, {}).pipe(
      tap(() => this._handleConnection(false)),
    );
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

  private _handleConnection(isConnected: boolean) {
    this.connectionSubject.next(isConnected);

    localStorage.setItem('isConnected', `${+isConnected}`);
  }
}
