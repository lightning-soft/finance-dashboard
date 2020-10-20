import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RITHMIC_API_URL } from 'communication';
import { Observable } from 'rxjs';
import { IAccount } from 'trading';

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

  public createAccount(account: IAccount, password: string): Observable<object> {
    const reqBody: IConnectionRequestData = {
      username: account.name,
      password,
      connectionPointId: ''
    };

    // const reqBody: IConnectionRequestData = {
    //   username: "nebasa9788@uniteditcare.com",
    //   password: "123456",
    //   connectionPointId: "string"
    // };

    // return this._request(reqBody, account.server);
    return this._request(reqBody, 'http://173.212.193.40:5005');
  }

  public logout(): Observable<any> {
    return this._http.post(`${RITHMIC_API_URL}Connection/logout`, {});
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
