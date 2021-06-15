import { Injectable } from '@angular/core';
import { IBaseItem, Repository } from 'communication';
import { IBar } from 'chart';

export interface IHistoryItem extends IBaseItem, IBar { }

@Injectable()
export abstract class HistoryRepository extends Repository<IHistoryItem> {
}
