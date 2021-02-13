import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotifierService } from 'notifier';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { Storage } from 'storage';

export type Token = string;
const tokenKey = 'token';
const refreshTokenKey = 'refresh_token';
const expirationDateKey = 'accessTokenExpirationDate';

export type UserIdentityInfo = {
  name: string;
  preferred_username: string;
  sub: string;
};
const headers = new HttpHeaders({
  'Content-Type': 'application/x-www-form-urlencoded',
  'accept': 'application/json',
});

@Injectable()
export class AuthService {

  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _token: string;
  private _refreshToken: string;

  userInfo: UserIdentityInfo;
  private refreshTokenTimeout;

  constructor(
    private _notification: NotifierService,
    private _appConfig: AppConfig,
    private storage: Storage,
    private _http: HttpClient
  ) { }

  get tokenExpirationDate(): number {
    return this.storage.getItem(expirationDateKey);
  }

  public getToken(): Token {
    return this.storage.getItem(tokenKey);
  }

   getRefreshToken(){
    return this.storage.getItem(refreshTokenKey);
  }

  refreshToken() {
    const refreshToken = this.storage.getItem(refreshTokenKey);
    const data = new URLSearchParams();
    const { url, clientId, clientSecret } = this._appConfig.identity;
    data.set('client_id', clientId);
    data.set('client_secret', clientSecret);
    data.set('grant_type', 'refresh_token');
    data.set('refresh_token', refreshToken);
    return this._http.post(url + 'connect/token', data.toString(), { headers })
      .pipe(tap(item => {
        this._storeTokens(item);
      }));
  }

  private _storeTokens(data) {
    this._token = data.access_token;
    const expiresIn = data.expires_in;
    const expirationDate = Date.now() + (expiresIn * 1000);
    this._refreshToken = data.refresh_token;
    this.storage.setItem(tokenKey, this._token);
    this.storage.setItem(expirationDateKey, expirationDate);
    this.storage.setItem(refreshTokenKey, this._refreshToken);
  }

  public logOut(): Observable<any> {
    const { url } = this._appConfig.identity;

    return this._http.get(`${url}account/logout`, {})
      .pipe(tap(res => this.isAuthenticated.next(false)));
  }

  public logOutWithRedirect() {
    const { url } = this._appConfig.identity;
    window.location.href = `${url}account/logout`;
  }

  public async initialize(code: Token): Promise<UserIdentityInfo> {
    if (!code) {
      console.log('Code is not exist');
      return;
    }

    const { url, clientId, clientSecret, redirectUri } = this._appConfig.identity;

    const data = new URLSearchParams();

    data.set('client_id', clientId);
    data.set('client_secret', clientSecret);
    data.set('code', code);
    data.set('grant_type', "authorization_code");
    data.set('redirect_uri', redirectUri);
    return await this._http.post(`${url}connect/token`, data.toString(), { headers })
      .pipe(
        mergeMap((response: any) => {
          this._storeTokens(response);
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
            this.refreshToken().toPromise();
          },
          (e) => this._notification.showError(e.message)
        )
      )
      .toPromise();
  }
}
