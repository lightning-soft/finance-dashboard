import { Injectable, Injector } from '@angular/core';
import { Broker } from './broker';
import { BaseBroker } from './base-broker';

@Injectable({
  providedIn: 'root',
})
export class BrokerService {
  private _activeKey: Broker;

  private _brokers: { [key in Broker]?: new (...args: any[]) => BaseBroker } = {};

  private _injectedBrokers: { [key in Broker]?: BaseBroker } = {};

  constructor(private _injector: Injector) { }

  get(key: Broker): BaseBroker {
    if (!this._injectedBrokers[key]) {
      this._injectedBrokers[key] = this._injector.get(this._brokers[key]);
    }

    return this._injectedBrokers[key];
  }

  getActive(): BaseBroker {
    if (!this._activeKey) {
      const key = Object.keys(this._brokers)[0] as Broker;

      this.activate(key);
    }

    return this.get(this._activeKey);
  }

  activate(key: Broker) {
    this.get(key).activate();

    this._activeKey = key;
  }
}
