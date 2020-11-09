import { Injectable } from '@angular/core';
import { IBaseItem, Repository } from 'communication';

export interface IBar {
  close: number;
  high: number;
  low: number;
  open: number;
  date: Date;
  volume: number;
}

export interface IHistoryItem extends IBaseItem, IBar { }

@Injectable()
export abstract class HistoryRepository extends Repository<IHistoryItem> {

}
