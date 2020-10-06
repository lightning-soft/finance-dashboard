import { Observable, of, throwError } from 'rxjs';
import { IBaseItem as IBaseItem } from './item';
import { IPaginationResponse } from './pagination';

export type ExcludeId<T> = {
  [P in Exclude<keyof T, keyof IBaseItem>]?: T[P]
};

export enum RealtimeAction {
  Create = 'created',
  Update = 'updated',
  Delete = 'deleted',
}
export abstract class Repository<T extends IBaseItem = any> {

  protected _onCreate = this._bindRealtime(RealtimeAction.Create);
  protected _onUpdate = this._bindRealtime(RealtimeAction.Update);
  protected _onDelete = this._bindRealtime(RealtimeAction.Delete);

  abstract getItemById(id): Observable<T>;

  abstract createItem(item: ExcludeId<T>, options?: any, projectId?: number): Observable<T>;

  abstract updateItem(item: T): Observable<T>;

  patchItem(item: Partial<T>, field?: string): Observable<Partial<T>> {
    return throwError(`Implement patchItem for ${this.constructor.name}`);
  }

  abstract deleteItem(id: number | string): Observable<boolean>;

  abstract getItems(params?): Observable<IPaginationResponse<T>>;

  getItemsByIds(ids: number[]): Observable<T[]> {
    console.error('implement getItemsByIds');
    return of([]);
  }

  _emitRealtime(items, action: RealtimeAction) {
    if (Array.isArray(items)) {
      items.map(i => this._emitRealtime(i, action));
    } else {
      console.log('_emitRealtime', action, items);
      // if (this._realtimeProvider)
      //     this._realtimeProvider.notifyInternal({
      //         payload: items,
      //         type: RealtimeProvider.getType(action, suffix == null ? this._getType() : suffix)
      //     });
    }
  }

  deleteMany(params: any): Observable<boolean> {
    throw new Error('Please implement deleteMany');
  }

  protected _bindRealtime(action: RealtimeAction) {
    return (item) => this._emitRealtime(item, action);
  }
}
