import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFormValues } from './account-connect/account-connect.component';

export interface IConnectionRequestData {
  username: string;
  password: string;
  connectionPointId?: string;
}

export enum DatafeedApi {
  CONNECTION = '/api/Connection',
  HISTORY = '/api/History/',
  INSTRUMENT = '/api/Instrument'
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private _http: HttpClient) { }

  public request(data: IFormValues): Observable<object> {
    const reqBody: IConnectionRequestData = {
      username: data.login,
      password: data.password,
      connectionPointId: ''
    };

    // const reqBody: IConnectionRequestData = {
    //   username: "logami9524@abbuzz.com",
    //   password: "123456",
    //   connectionPointId: "string",
    // };

    return this._request(reqBody, '');
  }

  private _request(data: IConnectionRequestData, server: string): Observable<object> {

    const url = `${server}${DatafeedApi.CONNECTION}`;
    const body = JSON.stringify(data);
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    return this._http.post(url, body, options);
  }

}
