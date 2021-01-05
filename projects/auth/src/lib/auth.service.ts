import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotifierService } from 'notifier';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { Storage } from 'storage';

export type Token = string;
const tokenKey = 'token';

export type UserIdentityInfo = {
  name: string;
  preferred_username: string;
  sub: string;
};

@Injectable()
export class AuthService {

  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _token: string;

  userInfo: UserIdentityInfo;

  constructor(
    private _notification: NotifierService,
    private _appConfig: AppConfig,
    private storage: Storage,
    private _http: HttpClient
  ) { }

  public getToken(): Token {
    /**
     * To-do get token from some storage
     */

   return  this.storage.getItem(tokenKey);
  }

  public logOut(): Observable<any> {
    const { url } = this._appConfig.identity;

    return this._http.post(`${url}account/logout`, {})
      .pipe(tap(res => this.isAuthenticated.next(false)));
  }

   public async initialize(code: Token): Promise<UserIdentityInfo> {
    if (!code) {
      console.log('Code is not exist');
      return;
    }

    const { url, clientId, clientSecret, redirectUri } = this._appConfig.identity;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json',
    });
    const data = new URLSearchParams();

    data.set('client_id', clientId);
    data.set('client_secret', clientSecret);
    data.set('code', code);
    data.set('grant_type', "authorization_code");
    data.set('redirect_uri', redirectUri);

    return await this._http.post(`${url}connect/token`, data.toString(), { headers })
      .pipe(
        mergeMap((data: any) => {
          /**
           * To-do token storage
           */
          this._token = data.access_token;
          this.storage.setItem(tokenKey, this._token);
          return this._http.get(`${url}connect/userinfo`, {
            headers: {
              Authorization: 'Bearer ' + this._token
            }
          });
        }),
        tap(
          (res: UserIdentityInfo) => {
            this.userInfo = res;
            this.isAuthenticated.next(true);
          },
          (e) => this._notification.showError(e.message)
        )
      )
      .toPromise();
  }
}
