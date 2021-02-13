import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take, switchMap } from 'rxjs/operators';

const ignoredUrls = ['config/config.json', 'connect/token', 'account/logout'];

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(public auth: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this._shouldHandleRefreshToken(request)) {
      return this._handleRefreshToken(request, next);
    }

    request = this._prepareRequest(request);
    return next.handle(request);
  }

  private _shouldHandleRefreshToken(request) {
    const isInIgnoreList = ignoredUrls.find(item => request.url.includes(item));

    return !isInIgnoreList && this.auth.isTokenInvalid();
  }

  private _handleRefreshToken(request, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.auth.refreshToken().pipe(
        switchMap(item => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(item);
          request = this._prepareRequest(request);
          return next.handle(this._prepareRequest(request));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(data => data != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this._prepareRequest(request));
        }));
    }
  }

  private _prepareRequest(request) {
    const token = this.auth.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return request;
  }
}
