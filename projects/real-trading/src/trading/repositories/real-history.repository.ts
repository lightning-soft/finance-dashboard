import { Injectable } from '@angular/core';
import { IBaseItem } from 'communication';
import { IBar } from 'chart';
import { BaseRepository } from './base-repository';
import { HistoryRepository } from "trading";

declare const moment: any;

export interface IHistoryItem extends IBaseItem, IBar { }

@Injectable()
export class RealHistoryRepository extends BaseRepository<IHistoryItem> implements HistoryRepository {
  protected get suffix(): string {
    return 'History';
  }

  protected _mapResponseItem(item: any): IHistoryItem {
    return {
      id: item.id,
      date: moment.utc(item.timestamp).toDate(),
      open: item.openPrice,
      close: item.closePrice,
      high: item.highPrice,
      low: item.lowPrice,
      volume: item.volume,
      details: (item.details ?? []).map(i => ({
        ...i,
        tradesCount: i.bidInfo.tradesCount + i.askInfo.tradesCount,
      })),
    };
  }
}
