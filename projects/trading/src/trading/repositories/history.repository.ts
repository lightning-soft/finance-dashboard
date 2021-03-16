import { Injectable } from '@angular/core';
import { IBaseItem, Repository } from 'communication';
import { IBar } from 'chart';
import { IConnection } from '../models';

export interface IHistoryItem extends IBaseItem, IBar { }

@Injectable()
export abstract class HistoryRepository extends Repository<IHistoryItem> {
  abstract forConnection(connection: IConnection);
}
