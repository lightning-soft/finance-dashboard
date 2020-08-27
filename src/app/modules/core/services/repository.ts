import { Observable } from 'rxjs';
import { IPaginationResponse } from '../models';

export abstract class Repository<T> {
    abstract getItemById(id): Observable<T>;
    abstract createItem(item: T): Observable<T>;
    abstract updateItem(item: T): Observable<T>;
    abstract deleteItem(id: number | string): Observable<boolean>;
    abstract getItems(params?): Observable<IPaginationResponse<T>>;
}
