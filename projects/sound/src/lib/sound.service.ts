import { Inject, Injectable, InjectionToken } from '@angular/core';

export enum Sound {
  CONNECTED = 'connectedSound',
  CONNECTION_LOST = 'connectionLostSound',
  ORDER_FILLED = 'orderFilledSound',
  ORDER_CANCELLED = 'orderCancelledSound',
  ORDER_REPLACED = 'orderReplacedSound',
  ORDER_PENDING = 'orderPendingSound',
  ORDER_REJECTED = 'orderRejectedSound',
  TARGET_FILLED = 'targetFilledSound',
  STOP_FILLED = 'stopFilledSound',
  ALERT = 'alertSound'
}

export const SettingsStore = new InjectionToken('SettingsStore');

@Injectable()
export class SoundService {
  private readonly _store = new Map();

  constructor(
    @Inject(SettingsStore) private readonly _settingsStore: any,
  ) { }

  play(name: Sound): void {
    const setting = this._settingsStore.settings.value;
    const value = setting[name];

    const isPlay: boolean = setting.sound;

    if (!value.checked || !isPlay) return;

    const volume = value.volume / 100 ?? 1;

    this.playByName(value.name, volume);
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
