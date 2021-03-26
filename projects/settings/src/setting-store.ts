import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { SettingsData } from './types';
import { SettingsRepository } from 'trading';
import { map, tap } from 'rxjs/operators';
import { KeyBinding } from 'keyboard';


export interface ISettingsStore {
  getItem(): Observable<any>;

  setItem(data: any): Observable<any>;
}

@Injectable()
export class SettingsStore implements ISettingsStore {
  hasSettings = false;

  constructor(private settingsRepository: SettingsRepository) {
  }

  getItem(): Observable<SettingsData> {
    return this.settingsRepository.getItems()
      .pipe(
        map((item: any) => item.settings),
        tap(() => {
          this.hasSettings = true;
        })) as any;
  }

  setItem(settingsData: SettingsData): Observable<any> {
    const settings = { ...settingsData };
    if (this.hasSettings)
      return this.settingsRepository.updateItem({ settings });
    else {
      return this.settingsRepository.createItem({ settings });

    }
  }

}
