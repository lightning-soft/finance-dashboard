import { Injectable, Injector } from '@angular/core';
import { Broker } from '../models';
import { BrokerRepository, HistoryRepository, InstrumentsRepository } from '../repositories';

@Injectable({
  providedIn: 'root',
})
export class BrokerService {
  private _repositories: BrokerRepository[];

  constructor(private _injector: Injector) {
    this._repositories = [
      this._injector.get(InstrumentsRepository),
      this._injector.get(HistoryRepository),
    ];
  }

  activate(key: Broker) {
    this._repositories.forEach(repository => {
      repository.switch(key);
    });
  }
}
