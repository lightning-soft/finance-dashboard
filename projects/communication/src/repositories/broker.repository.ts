import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { IBaseItem } from '../common';
import { CommunicationConfig, HttpRepository } from '../http';
import { Broker } from '../services';

@Injectable()
export abstract class BrokerRepository<T extends IBaseItem = any> extends HttpRepository<T> {
  protected _key: Broker;
  protected _itemName: string;

  protected get _baseUrl(): string {
    return this._config[this._key].http.url + this._itemName;
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

  constructor(
    protected _http: HttpClient,
    protected _config: CommunicationConfig,
    protected _cookieService: CookieService,
  ) {
    super(_http, _config);
  }

  switch(key: Broker) {
    this._key = key;
  }
}
