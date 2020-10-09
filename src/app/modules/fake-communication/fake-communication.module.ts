import { ModuleWithProviders, NgModule, NgZone } from '@angular/core';
import { OrdersRepository, PositionsRepository } from 'trading'; //Error
import { Datafeed, InstrumentsRepository } from '../trading'; //Error
import { FakeDatafeed, FakeInstrumentsRepository, FakeOrdersRepository, FakePositionsRepository } from './trading';

@NgModule({})
export class FakeCommunicationModule {
  static forRoot(): ModuleWithProviders<FakeCommunicationModule> {
    return {
      ngModule: FakeCommunicationModule,
      providers: [
        {
          provide: InstrumentsRepository,
          useClass: FakeInstrumentsRepository,
        },
        {
          provide: Datafeed,
          useClass: FakeDatafeed,
          deps: [NgZone],
        },
        {
          provide: PositionsRepository,
          useClass: FakePositionsRepository
        },
        {
          provide: OrdersRepository,
          useClass: FakeOrdersRepository
        }
      ]
    };
  }
}
