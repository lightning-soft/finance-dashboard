import { ModuleWithProviders, NgModule } from '@angular/core';
import { AccountRepository, OrdersRepository, PositionsRepository } from 'trading';
import { FakeAccountRepository, FakeOrdersRepository, FakePositionsRepository } from './trading';

@NgModule({})
export class FakeCommunicationModule {
  static forRoot(): ModuleWithProviders<FakeCommunicationModule> {
    return {
      ngModule: FakeCommunicationModule,
      providers: [
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
