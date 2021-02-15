import { Injectable } from '@angular/core';
import { TradePrint } from '../models/trade-print';
import { DataFeed } from './data-feed';

@Injectable()
export abstract class TradeDataFeed extends DataFeed<TradePrint>{
}

