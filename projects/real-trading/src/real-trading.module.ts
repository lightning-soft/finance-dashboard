import { ModuleWithProviders, NgModule } from '@angular/core';
import { FakeTradeDatafeed } from 'fake-communication';
import {
  TradeDataFeed,
  AccountRepository, BrokersRepository,
  ConnectionsRepository, HistoryRepository,
  InstrumentsRepository, Level1DataFeed,
  OrdersFeed,
  OrdersRepository,
  PositionsFeed,
  PositionsRepository,
  Level2DataFeed,
  SettingsRepository,
  OrderBooksRepository,
  VolumeHistoryRepository,
} from 'trading';
import {
  RealAccountRepository,
  RealBrokersRepository, RealConnectionsRepository, RealHistoryRepository,
  RealInstrumentsRepository, RealLevel1DataFeed,
  RealOrdersFeed,
  RealOrdersRepository,
  RealPositionsFeed, RealPositionsRepository,
  RealLevel2DataFeed, RealSettingsRepository,
  RealOrderBooksRepository,
  RealTradeDataFeed,
  RealVolumeHistoryRepository
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
          provide: SettingsRepository,
          useClass: RealSettingsRepository,
        },
        {
          provide: ConnectionsRepository,
          useClass: RealConnectionsRepository,
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
          provide: VolumeHistoryRepository,
          useClass: RealVolumeHistoryRepository,
        },
        {
          provide: Level1DataFeed,
          // useClass: FakeLevel1Datafeed,
          useClass: RealLevel1DataFeed,
        },
        {
          provide: Level2DataFeed,
          useClass: RealLevel2DataFeed,
          // useClass: FakeLevel2Datafeed,
        },
        {
          provide: TradeDataFeed,
          useClass: RealTradeDataFeed,
          // useClass: FakeTradeDatafeed,
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
        {
          provide: OrderBooksRepository,
          useClass: RealOrderBooksRepository,
        },
      ]
    };
  }
}
