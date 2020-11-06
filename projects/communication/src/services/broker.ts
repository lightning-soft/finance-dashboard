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
}
