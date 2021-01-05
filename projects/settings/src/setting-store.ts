import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { SettingsData } from './types';
import { SettingsRepository } from 'trading';

const localStorageKey = 'settings';

export interface ISettingsStore {
  getItem(): Observable<any>;

  setItem(data: any): Observable<any>;
}

@Injectable()
export class SettingsStore implements ISettingsStore {
  constructor(private settingsRepository: SettingsRepository) {
  }

  data;

  getItem(): Observable<SettingsData> {
    const data = this.settingsRepository.getItems() as any;
    this.data = data;
    return data;
  }

  setItem(data: SettingsData): Observable<any> {
    if (this.data.id)
      return this.settingsRepository.updateItem(data as any);
    else {
      return this.settingsRepository.createItem(data);

    }
  }

}
