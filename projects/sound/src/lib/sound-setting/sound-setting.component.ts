import { Component, Inject, Input } from '@angular/core';
import { ISound } from '../sound.interface';
import { SettingsStore } from '../sound.service';

export enum SoundSetting {
  CONNECTED = 'connected',
  CONNECTION_LOST = 'connectionLost',
  ORDER_FILLED = 'orderFilled',
  ORDER_CANCELLED = 'orderCancelled',
  ORDER_REPLACED = 'orderReplaced',
  ORDER_PENDING = 'orderPending',
  ORDER_REJECTED = 'orderRejected',
  TARGET_FILLED = 'targetFilled',
  STOP_FILLED = 'stopFilled',
  ALERT = 'alert',
  IS_PLAY = 'isPlay'
}

@Component({
  selector: 'lib-sound-setting',
  templateUrl: './sound-setting.component.html',
  styleUrls: ['./sound-setting.component.scss']
})
export class SoundSettingComponent {
  @Input() checked = false;
  @Input() name: string;
  @Input() selectedSound: string;
  @Input() volume: number;

  constructor(
    @Inject(SettingsStore) private readonly _settingsStore: any,
  ) { }

  formatter(value: number): string {
    return `${value}%`;
  }

  changeCheckbox(value): void {
    this.checked = value?.target?.checked;
    this.save();
  }

  save() {
    const settingsService = this._settingsStore;

    let name = this.name;
    const checked = this.checked;
    const selectedSound = this.selectedSound;
    const volume = this.volume;
    const value: ISound = { name, checked, selectedSound, volume };

    name = name.charAt(0).toLowerCase() + name.slice(1);
    name = name.replace(" ", "");
    settingsService.saveSounds(name, value);
  }
}
