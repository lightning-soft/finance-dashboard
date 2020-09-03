import { ILayoutStore } from './layout-store';
import { Observable, of } from 'rxjs';
import { Storage } from 'storage';
import { Injectable } from '@angular/core';

const localStorageKey = 'layoutConfig';

@Injectable()
export class LocalLayoutStore implements ILayoutStore {
  constructor(private storage: Storage) {
  }

  getItem(): Observable<any> {
    return of(this.storage.getItem(localStorageKey));
  }

  setItem(data: any): Observable<any> {
    return of(this.storage.setItem(localStorageKey, data));
  }

}
