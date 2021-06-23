import { Injectable } from '@angular/core';
import { HttpRepository, IBaseItem } from 'communication';
import { Broker } from 'trading';

@Injectable()
export class RealBrokerRepository<T extends IBaseItem = any> extends HttpRepository<T> {
  protected _key: Broker = Broker.Rithmic;
  protected _itemName: string;

  protected get _baseUrl(): string {
    return this._communicationConfig[this._key].http.url + this._itemName;
  }

  switch(key: Broker) {
    this._key = key;
  }
}
