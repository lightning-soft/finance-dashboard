import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Observable, Subject, Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { CommunicationConfig } from '../http';
import { BrokerRepository, HistoryRepository, InstrumentsRepository } from '../repositories';

export enum Broker {
  Rithmic = 'rithmic',
}

@Injectable()
export abstract class BaseBroker {
  protected _key: Broker;
  protected _connectionSubject: Subject<boolean> = new Subject();

  protected get _apiUrl(): string {
    return this._config[this._key].http.url;
  }

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

  private _repositories: BrokerRepository[];

  constructor(
    protected _injector: Injector,
    protected _http: HttpClient,
    protected _cookieService: CookieService,
    protected _config: CommunicationConfig,
    protected _instrumentsRepository: InstrumentsRepository,
  ) {
    this._repositories = [
      this._injector.get(InstrumentsRepository),
      this._injector.get(HistoryRepository),
    ];
  }

  abstract connect(login: string, password: string): Observable<any>;

  abstract disconnect(): Observable<any>;

  activate() {
    this._repositories.forEach(repository => {
      repository.switch(this._key);
    });
  }

  handleConnection(callback: (isConnected: boolean) => void, instance = null): Subscription {
    const connections = this._getConnections();

    const isConnected = connections.includes(this._key);

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

    const key = this._key;
    const connections = this._getConnections();

    if (isConnected) {
      if (!connections.includes(key)) {
        this._setConnections([...connections, key]);
      }
    } else {
      this._setConnections(connections.filter(c => c !== key));
    }
  }

  protected _getConnections(): string[] {
    try {
      return JSON.parse(localStorage.getItem('connections')) as string[] || [];
    } catch {
      return [];
    }
  }

  protected _setConnections(connections: string[]) {
    localStorage.setItem('connections', JSON.stringify(connections));
  }
}
