import { NgModule, ModuleWithProviders, NgZone } from '@angular/core';
import {InstrumentsRepository, Datafeed, AccountRepository} from '../communication';
import {FakeInstrumentsRepository, FakeDatafeed, FakeAccountRepository} from './trading';
import { PositionsRepository } from '../communication/trading/repositories/positions.repository';
import { FakePositionsRepository } from './trading/fake-positions-repository';
import {OrdersRepository} from '../communication/trading/repositories/orders.repository';
import {FakeOrdersRepository} from './trading/fake-orders.repository';

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
              },
              {
                provide: AccountRepository,
                useClass: FakeAccountRepository
              }
            ]
        };
    }
}
