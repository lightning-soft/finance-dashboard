import { ModuleWithProviders, NgModule } from '@angular/core';
import { FakeDatafeed } from 'fake-communication';
import {
  AccountRepository, BrokersRepository,
  ConnectionsRepository, HistoryRepository,
  InstrumentsRepository, LevelOneDataFeed,
  OrdersFeed,
  OrdersRepository,
  PositionsFeed,
  PositionsRepository,
  LevelTwoDataFeed,
} from 'trading';
import {
  RealAccountRepository,
  RealBrokersRepository, RealConnectionsRepository, RealHistoryRepository,
  RealInstrumentsRepository, RealLevelOneDataFeed,
  RealOrdersFeed,
  RealOrdersRepository,
  RealPositionsFeed, RealPositionsRepository,
  RealLevelTwoDataFeed,
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
          provide: LevelOneDataFeed,
          // useClass: FakeDatafeed,
          useClass: RealLevelOneDataFeed,
        },
        {
          provide: LevelTwoDataFeed,
          useClass: RealLevelTwoDataFeed,
          // useClass: RealLevelOneDataFeed,
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
        {
          provide: OrdersFeed,
          useClass: RealOrdersFeed,
        },
        {
          provide: PositionsFeed,
          useClass: RealPositionsFeed,
        },
      ]
    };
  }
}
