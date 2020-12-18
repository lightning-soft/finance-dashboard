import { Injectable } from '@angular/core';
import { Storage } from '../../../../storage';
import { Observable, of } from 'rxjs';
const storageKey = 'dom-settings';

@Injectable()
export class DomSettingsStore {
  constructor(private storage: Storage) { }

  setSettings(data: any): Observable<void> {
    return of(this.storage.setItem(storageKey, data));
  }

  getSettings(): Observable<any> {
    const items = this.storage.getItem(storageKey);
    return of(items);
  }

}
