import { ExcludeId, RepositoryActionData } from 'communication';
import { Observable, Subscription } from 'rxjs';
import { IPaginationResponse } from '../models';

export abstract class Repository<T> {
  abstract subscribe(callback: (data: RepositoryActionData<T>) => void): Subscription;
  abstract getItemById(id): Observable<T>;
  abstract createItem(item: ExcludeId<T>): Observable<T>;
  abstract updateItem(item: T): Observable<T>;
  abstract deleteItem(id: number | string): Observable<boolean>;
  abstract deleteMany(params: any): Observable<boolean>;
  abstract getItems(params?): Observable<IPaginationResponse<T>>;
}
