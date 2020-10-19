import { Observable } from 'rxjs';

export abstract class ILayoutStore {
  abstract getItem(): Observable<any>;
  abstract setItem(data: any): Observable<any>;
}
