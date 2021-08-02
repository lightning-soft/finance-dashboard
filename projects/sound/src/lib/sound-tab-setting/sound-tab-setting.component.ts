import { Component, Inject, InjectionToken } from '@angular/core';
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
      value?.connectedSound,
      value?.connectionLostSound,
      value?.orderFilledSound,
      value?.orderCancelledSound,
      value?.orderReplacedSound,
      value?.orderPendingSound,
      value?.orderRejectedSound,
      value?.targetFilledSound,
      value?.stopFilledSound,
      value?.alertSound,
    ];
  }

  save(): void {
    this._settingsStore.saveSound(SoundSetting.IS_PLAY, this.switchValue);
  }

}
