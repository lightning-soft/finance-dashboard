import { Injectable } from '@angular/core';
import { HttpRepository, IBaseItem } from 'communication';
import { CookieService } from 'ngx-cookie-service';
import { Broker } from 'trading';

@Injectable()
export class RealBrokerRepository<T extends IBaseItem = any> extends HttpRepository<T> {
  protected _key: Broker = Broker.Rithmic;
  protected _itemName: string;

  protected get _baseUrl(): string {
    return this._communicationConfig[this._key].http.url + this._itemName;
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

  private _cookieService: CookieService;

  onInit() {
    this._cookieService = this._injector.get(CookieService);
  }

  switch(key: Broker) {
    this._key = key;
  }
}
