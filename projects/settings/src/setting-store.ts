import { Observable, of } from 'rxjs';
import { Storage } from 'storage';
import { Injectable } from '@angular/core';

const localStorageKey = 'settings';

export interface ISettingsStore {
  getItem(): Observable<any>;
  setItem(data: any): Observable<any>;
}

@Injectable()
export class SettingsStore implements ISettingsStore {
  constructor(private storage: Storage) {}

  getItem(): Observable<any> {
    return of(this.storage.getItem(localStorageKey));
  }

  setItem(data: any): Observable<any> {
    return of(this.storage.setItem(localStorageKey, data));
  }

}
