import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  AccountInfoRepository,
  AccountRepository,
  BarDataFeed,
  BrokersRepository,
  ConnectionsRepository,
  HistoryRepository,
  InstrumentsRepository,
  Level1DataFeed,
  Level2DataFeed,
  OHLVFeed,
  OrderBooksRepository,
  OrdersFeed,
  OrdersRepository,
  PositionsFeed,
  PositionsRepository,
  SessionsRepository,
  SettingsRepository,
  SettleDataFeed,
  TimezonesRepository,
  TradeDataFeed,
  VolumeDataFeed,
  VolumeHistoryRepository,
} from 'trading';
import {
  RealAccountRepository,
  RealBarDataFeed,
  RealBrokersRepository,
  RealConnectionsRepository,
  RealHistoryRepository,
  RealInstrumentsRepository,
  RealLevel1DataFeed,
  RealLevel2DataFeed,
  RealOHLVFeed,
  RealOrderBooksRepository,
  RealOrdersFeed,
  RealOrdersRepository,
  RealPositionsFeed,
  RealPositionsRepository,
  RealSessionsRepository,
  RealSettingsRepository,
  RealSettleDataFeed,
  RealTimezonesRepository,
  RealTradeDataFeed,
  RealVolumeDatafeed,
  RealVolumeHistoryRepository,
} from './trading/repositories';
import { RealAccountInfoRepository } from './trading/repositories/real-account-info.repository';

// import { FakeLevel2Datafeed } from '../../fake-communication/src/trading/fake-level2.datafeed';

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
        {
          provide: AccountInfoRepository,
          useClass: RealAccountInfoRepository,
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
          provide: BarDataFeed,
          useClass: RealBarDataFeed,
        },
        {
          provide: VolumeDataFeed,
          useClass: RealVolumeDatafeed,
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
        {
          provide: SettleDataFeed,
          useClass: RealSettleDataFeed,
        },
        {
          provide: OHLVFeed,
          useClass: RealOHLVFeed,
        },
        {
          provide: SessionsRepository,
          useClass: RealSessionsRepository,
        },
        {
          provide: TimezonesRepository,
          useClass: RealTimezonesRepository,
        },
      ]
    };
  }
}
