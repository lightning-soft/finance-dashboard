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
        map(settings => {
          this.hasSettings = true;
          const hotkeys = [...settings.hotkeys].map(item => {
            item[1] = KeyBinding.fromDTO(item[1]);
            return item;
          });
          settings.hotkeys = hotkeys;
          return settings;
        })) as any;
  }

  setItem(_settings: SettingsData): Observable<any> {
    const settings = { ..._settings, hotkeys: [..._settings.hotkeys] };
    settings.hotkeys = _settings.hotkeys.map(item => {
        const result = [...item];
        result[1] = item[1].toDTO() as any;
        return result as any;
      }
    );
    if (this.hasSettings)
      return this.settingsRepository.updateItem({ settings });
    else {
      return this.settingsRepository.createItem({ settings });

    }
  }

}
