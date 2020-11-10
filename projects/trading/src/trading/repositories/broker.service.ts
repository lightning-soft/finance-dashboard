import { Injectable, Injector } from '@angular/core';
import { Broker } from '../models';
import { BrokersRepository } from './brokers.repository';

@Injectable()
export class BrokerService {
  private _repositories: BrokersRepository[];

  constructor(private _injector: Injector) {
    this._repositories = [
    ];
  }

  activate(key: Broker) {
    this._repositories.forEach(repository => {
      // repository.switch(key);
    });
  }
}
