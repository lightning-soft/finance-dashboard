import { InjectionToken } from '@angular/core';
import { IBaseItem, Id } from 'communication';
import { Observable } from 'rxjs';


export interface GetItemsRepository<T> {
  getItemsByIds(ids: Id[]): Observable<T[]>;
}

export interface ItemsStoreConfig {
  [key: string]: GetItemsRepository<IBaseItem>;
}

export const ItemsStoreConfigToken = new InjectionToken<ItemsStoreConfig>('ItemsStoreConfig');
