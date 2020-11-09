import { ModuleWithProviders, NgModule, NgZone } from '@angular/core';
import { AccountRepository, Datafeed, OrdersRepository, PositionsRepository } from 'trading';
import { FakeAccountRepository, FakeDatafeed, FakeOrdersRepository, FakePositionsRepository } from './trading';

@NgModule({})
export class FakeCommunicationModule {
    static forRoot(): ModuleWithProviders<FakeCommunicationModule> {
        return {
            ngModule: FakeCommunicationModule,
            providers: [
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
