import { Injectable, Injector } from '@angular/core';
import { Broker } from '../models';
import { BrokerRepository } from './brokers.repository';
import { HistoryRepository } from './history.repository';

@Injectable()
export class BrokerService {
  private _repositories: BrokerRepository[];

  constructor(private _injector: Injector) {
    this._repositories = [
      this._injector.get(HistoryRepository),
    ];
  }

  activate(key: Broker) {
    this._repositories.forEach(repository => {
      repository.switch(key);
    });
  }
}
