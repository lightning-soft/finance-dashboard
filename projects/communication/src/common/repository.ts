import { Observable, of, Subject, throwError } from 'rxjs';
import { IBaseItem } from './item';
import { IPaginationResponse } from './pagination';

export type ExcludeId<T> = {
  [P in Exclude<keyof T, keyof IBaseItem>]?: T[P]
};

export enum RepositoryAction {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export interface RepositoryActionData<T> {
  action: RepositoryAction;
  items: T[];
}

export abstract class Repository<T extends IBaseItem = any> {

  actions: Subject<RepositoryActionData<T>> = new Subject();

  protected _onCreate = this._bindEmit(RepositoryAction.Create);
  protected _onUpdate = this._bindEmit(RepositoryAction.Update);
  protected _onDelete = this._bindEmit(RepositoryAction.Delete);

  connection;

  get(connection: any) {
    this.connection = connection;
    return this;
  }

  abstract getItemById(id, query?: any): Observable<T>;

  abstract createItem(item: ExcludeId<T>, options?: any): Observable<T>;

  abstract updateItem(item: T, query?: any): Observable<T>;

  patchItem(item: Partial<T>, field?: string): Observable<Partial<T>> {
    return throwError(`Implement patchItem for ${this.constructor.name}`);
  }

  abstract deleteItem(id: number | string | T): Observable<boolean>;

  abstract getItems(params?): Observable<IPaginationResponse<T>>;

  getItemsByIds(ids: number[] | string[]): Observable<T[]> {
    console.error('implement getItemsByIds');
    return of([]);
  }

  deleteMany(params: any): Observable<boolean> {
    throw new Error('Please implement deleteMany');
  }

  protected _bindEmit(action: RepositoryAction) {
    return (data) => {
      if (data == null)
        return;

      const items = (Array.isArray(data) ? data : [data])
        .map(item => this._mapResponseItem(item, action));

      this.actions.next({
        action,
        items,
      });
    };
  }

  protected _mapItemsParams(params: any): any {
    return params;
  }

  protected _mapItemParams(params: any, action: RepositoryAction): any {
    return params;
  }

  protected _responseToItems(res: any, params: any): any[] {
    return res.result ?? res.data ?? res ?? [];
  }

  protected _responseToItem(res: any, params: any, action: RepositoryAction): any {
    return res.result ?? res.data ?? res;
  }

  protected _mapItemsResponse(res: any, params: any): IPaginationResponse<T> {
    const data = this._responseToItems(res, params)
      .map(item => this._mapResponseItem(item, RepositoryAction.Read));

    return { data, requestParams: params } as IPaginationResponse<T>;
  }

  protected _mapItemResponse(res: any, params: any, action: RepositoryAction): T {
    return this._mapResponseItem(this._responseToItem(res, params, action), action);
  }

  protected _mapResponseItem(item: any, action: RepositoryAction): T {
    return item;
  }

  protected _mapRequestItem(item: T | ExcludeId<T>, action: RepositoryAction): any {
    return item;
  }
}
