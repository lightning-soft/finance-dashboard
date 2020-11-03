import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseBroker, Broker } from './broker';

@Injectable({
  providedIn: 'root',
})
export class RithmicService extends BaseBroker {
  protected _key = Broker.Rithmic;

  connect(username: string, password: string): Observable<any> {
    const body = {
      username,
      password,
    };

    return this._http.post(`${this._apiUrl}Connection`, body).pipe(
      tap((res) => {
        this._apiKey = res.result.apiKey;

        this._handleConnection(true);
      }),
    );
  }

  disconnect(): Observable<any> {
    return this._http.post(`${this._apiUrl}Connection/logout`, {}, this._httpOptions).pipe(
      tap(() => {
        this._apiKey = null;

        this._handleConnection(false);
      }),
    );
  }
}
