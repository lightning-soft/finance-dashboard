import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  AccountRepository, BrokersRepository,
  DatafeedRepository, HistoryRepository,
  LevelOneDataFeedService,
  OrdersRepository,
  PositionsRepository,
  ConnectionsRepository,
  InstrumentsRepository,
} from 'trading';
import {
  RealAccountRepository, RealBrokerRepository,
  RealLevelOneDataFeed,
  RealOrdersRepository,
  RealPositionsRepository,
  RealHistoryRepository, RealConnectionsRepository,
  RealDatafeedRepository, RealInstrumentsRepository, RealBrokersRepository
} from './trading/repositories';


@NgModule({})
export class RealTradingModule {
  static forRoot(): ModuleWithProviders<RealTradingModule> {
    return {
      ngModule: RealTradingModule,
      providers: [
        {
          provide: AccountRepository,
          useClass: RealAccountRepository,
        },
        // {
        //   provide: BrokerRepository,
        //   useClass: RealBrokerRepository,
        // },
        {
          provide: ConnectionsRepository,
          useClass: RealConnectionsRepository,
        },
        {
          provide: InstrumentsRepository,
          useClass: RealInstrumentsRepository,
        },
        // {
        //   provide: DatafeedRepository,
        //   useClass: RealDatafeedRepository,
        // },
        {
          provide: InstrumentsRepository,
          useClass: RealInstrumentsRepository,
        },
        {
          provide: HistoryRepository,
          useClass: RealHistoryRepository,
        },
        {
          provide: InstrumentsRepository,
          useClass: RealInstrumentsRepository,
        },
        {
          provide: LevelOneDataFeedService,
          useClass: RealLevelOneDataFeed,
        },
        {
          provide: OrdersRepository,
          useClass: RealOrdersRepository,
        },
        {
          provide: PositionsRepository,
          useClass: RealPositionsRepository,
        },
        {
          provide: BrokersRepository,
          useClass: RealBrokersRepository,
        },
      ]
    };
  }
}
