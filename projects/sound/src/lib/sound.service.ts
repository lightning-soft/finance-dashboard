import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Subscription } from 'rxjs';

export enum Sound {
  CONNECTED = 'connected',
  CONNECTION_LOST = 'connectionLost',
  ORDER_FILLED = 'orderFilled',
  ORDER_CANCELLED = 'orderCancelled',
  ORDER_REPLACED = 'orderReplaced',
  ORDER_PENDING = 'orderPending',
  ORDER_REJECTED = 'orderRejected',
  TARGET_FILLED = 'targetFilled',
  STOP_FILLED = 'stopFilled',
  ALERT = 'alert'
}

export const SettingsStore = new InjectionToken('SettingsStore');

@Injectable()
export class SoundService {
  private readonly _store = new Map();
  private _pendingSounds = [];

  constructor(
    @Inject(SettingsStore) private readonly _settingsStore: any,
  ) {
    const sub: Subscription = _settingsStore.isSettingsLoaded$
      .subscribe(() => {
        this._pendingSounds.forEach((item) => {
          this.play(item);
        });
        this._pendingSounds = [];
      }, () => {}, () => sub?.unsubscribe());
  }

  play(name: Sound): void {
    if (!this._settingsStore.isSettingsLoaded) {
      this._createPengingTask(name);
      return;
    }
    const setting = this._settingsStore.settings.value.sound;
    const value = setting[name];

    const isPlay: boolean = setting.isPlay;

    if (!value.checked || !isPlay) return;

    const volume = value.volume / 100 ?? 1;

    this.playByName(value.selectedSound, volume);
  }

  _createPengingTask(name: Sound) {
    this._pendingSounds.push(name);
  }

  playByName(name: string, volume: number): void {
    let audio;
    const sound = this._store.get(name);
    if (sound && sound.volume === volume && sound.src === this._getUrlOfSound(name)) {
      audio = this._store.get(name);
    } else {
      audio = new Audio();
      audio.src = this._getUrlOfSound(name);
      audio.volume = volume;
      audio.load();
      this._store.set(name, audio);
    }

    audio.play();
  }

  private _getUrlOfSound(name: string): string {
    return `./assets/sounds/${name}.wav`;
  }
}
