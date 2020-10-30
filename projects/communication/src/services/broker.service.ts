import { Injectable, Injector } from '@angular/core';
import { Broker } from './broker';
import { RithmicService } from './rithmic.service';

@Injectable({
  providedIn: 'root',
})
export class BrokerService {
  private _brokers: { [key: string]: new (...args: any[]) => Broker } = {
    rithmic: RithmicService,
  };

  private _injectedBrokers: { [key: string]: Broker } = {};

  constructor(private _injector: Injector) {}

  get(key: string): Broker {
    if (!this._injectedBrokers[key]) {
      this._injectedBrokers[key] = this._injector.get(this._brokers[key]);
    }

    return this._injectedBrokers[key];
  }
}
