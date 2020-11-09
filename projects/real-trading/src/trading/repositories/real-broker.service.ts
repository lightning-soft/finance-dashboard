import { Injectable, Injector } from '@angular/core';
import { Broker } from 'trading';
import { BrokerRepository } from '../repositories';

@Injectable()
export class RealBrokerService {
  private _repositories: BrokerRepository[];

  constructor(private _injector: Injector) {
    this._repositories = [

    ];
  }

  activate(key: Broker) {
    this._repositories.forEach(repository => {
      repository.switch(key);
    });
  }
}
