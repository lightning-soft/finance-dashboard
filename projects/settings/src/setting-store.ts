import { Observable, of } from 'rxjs';
import { Storage } from 'storage';
import { Injectable } from '@angular/core';
import { SettingsData } from './types';

const localStorageKey = 'settings';

export interface ISettingsStore {
  getItem(): Observable<any>;
  setItem(data: any): Observable<any>;
}

@Injectable()
export class SettingsStore implements ISettingsStore {
  constructor(private _storage: Storage) {}

  getItem(): Observable<SettingsData> {
    return of(this._storage.getItem(localStorageKey));
  }

  setItem(data: SettingsData): Observable<any> {
    return of(this._storage.setItem(localStorageKey, data));
  }

}
