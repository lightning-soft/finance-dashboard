import { Component, Inject, InjectionToken } from '@angular/core';
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
    const value = this._settingsStore.settings.value;
    this.switchValue = value?.sound;

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
    this._settingsStore.saveSound(this.switchValue);
  }

}
