import { Observable, of, throwError } from 'rxjs';
import { IBaseItem as IBaseItem } from './item';

export type ExcludeId<T> = {
    [P in Exclude<keyof T, keyof IBaseItem>]?: T[P]
};

export abstract class Repository<T extends IBaseItem = any> {
    abstract getItemById(id): Observable<T>;

    abstract createItem(item: ExcludeId<T>, options?: any, projectId?: number): Observable<T>;

    abstract updateItem(item: T): Observable<T>;

    patchItem(item: Partial<T>, field?: string): Observable<Partial<T>> {
        return throwError(`Implement patchItem for ${this.constructor.name}`);
    }

    abstract deleteItem(id: number | string): Observable<boolean>;

    abstract getItems(params?): Observable<T[]>;

    getItemsByIds(ids: number[]): Observable<T[]> {
        console.error('implement getItemsByIds');
        return of([]);
    }
}
