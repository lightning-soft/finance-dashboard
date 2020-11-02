import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Observable, Subject, Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { CommunicationConfig } from '../http';

@Injectable()
export abstract class Broker {
  protected _apiUrl: string;
  protected _connectionSubject: Subject<boolean> = new Subject();

  protected get _apiKey(): string {
    return this._cookieService.get('apiKey');
  }

  protected set _apiKey(apiKey: string) {
    if (apiKey) {
      this._cookieService.set('apiKey', apiKey);
    } else {
      this._cookieService.delete('apiKey');
    }
  }

  protected get _httpOptions() {
    return {
      headers: {
        'Api-Key': this._apiKey,
      },
    };
  }

  constructor(
    protected _httpClient: HttpClient,
    protected _cookieService: CookieService,
    protected _config: CommunicationConfig,
  ) {
    this._apiUrl = this._config[this._getKey()].http.url;
  }

  protected abstract _getKey(): string;

  abstract connect(login: string, password: string): Observable<any>;

  abstract disconnect(): Observable<any>;

  handleConnection(callback: (isConnected: boolean) => void, instance = null): Subscription {
    const connections = this._getConnections();

    const isConnected = connections.indexOf(this._getKey()) !== -1;

    callback(isConnected);

    if (instance) {
      return this._connectionSubject
        .pipe(untilDestroyed(instance))
        .subscribe(callback);
    }

    return this._connectionSubject.subscribe(callback);
  }

  protected _handleConnection(isConnected: boolean) {
    this._connectionSubject.next(isConnected);

    const key = this._getKey();

    let connections = this._getConnections();

    if (connections.indexOf(key) === -1) {
      connections = isConnected ? [...connections, key] : connections.filter(c => c !== key);

      localStorage.setItem('connections', JSON.stringify(connections));
    }
  }

  protected _getConnections(): string[] {
    return (() => {
      try {
        return JSON.parse(localStorage.getItem('connections')) as string[] || [];
      } catch {
        return [];
      }
    })();
  }
}
