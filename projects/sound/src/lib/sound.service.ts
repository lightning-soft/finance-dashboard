import { Injectable } from '@angular/core';
import { SettingsService } from 'settings';

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

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private readonly _store = new Map();

  constructor(
    private readonly _settingsService: SettingsService,
  ) { }

  play(name: Sound): void {
    const setting = this._settingsService.settings.value;
    const value = setting[name];
    const volume = value.volume / 100 ?? 1;

    const isPlay: boolean = setting.sound;

    if (!value.checked || !isPlay) return;

    let audio;
    if (this._store.get(name)) {
      audio = this._store.get(name);
    } else {
      audio = new Audio();
      audio.src = `./assets/sounds/${value.name}.wav`;
      audio.volume = volume;
      audio.load();
      this._store.set(name, audio);
    }

    audio.play();
  }

  playByName(name: string, volume: number): void {
    volume = volume / 100;
    const audio = new Audio();
    audio.src = `./assets/sounds/${name}.wav`;
    audio.volume = volume;
    audio.load();
    audio.play();
  }
}
