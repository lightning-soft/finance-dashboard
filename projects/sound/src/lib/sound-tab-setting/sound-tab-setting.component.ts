import { Component, Inject } from '@angular/core';
import { SoundSetting } from '../sound-setting/sound-setting.component';
import { ISound } from '../sound.interface';
import { SettingsStore } from '../sound.service';

@Component({
  selector: 'lib-sound-tab-setting',
  templateUrl: './sound-tab-setting.component.html',
  styleUrls: ['./sound-tab-setting.component.css']
})
export class SoundTabSettingComponent {
  switchValue = true;
  readonly settings: ISound[] = [];

  constructor(
    @Inject(SettingsStore) private readonly _settingsStore: any,
  ) {
    const value = this._settingsStore.settings.value.sound;
    this.switchValue = value?.isPlay;

    this.settings = [
      value?.connected,
      value?.connectionLost,
      value?.orderFilled,
      value?.orderCancelled,
      // value?.orderReplaced,
      value?.orderPending,
      value?.orderRejected,
      // value?.targetFilled,
      value?.stopFilled,
      value?.alert,
    ];
  }

  save(): void {
    this._settingsStore.saveSounds(SoundSetting.IS_PLAY, this.switchValue);
  }

}
