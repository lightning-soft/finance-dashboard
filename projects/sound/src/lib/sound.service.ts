import { Inject, Injectable, InjectionToken } from '@angular/core';

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

  constructor(
    @Inject(SettingsStore) private readonly _settingsStore: any,
  ) { }

  play(name: Sound): void {
    const setting = this._settingsStore.settings.value.sound;
    const value = setting[name];

    const isPlay: boolean = setting.isPlay;

    if (!value.checked || !isPlay) return;

    const volume = value.volume / 100 ?? 1;

    this.playByName(value.selectedSound, volume);
  }

  playByName(name: string, volume: number): void {
    let audio;
    if (this._store.get(name)) {
      audio = this._store.get(name);
    } else {
      audio = new Audio();
      audio.src = `./assets/sounds/${name}.wav`;
      audio.volume = volume;
      audio.load();
      this._store.set(name, audio);
    }

    audio.play();
  }
}
