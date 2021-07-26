import { Component } from '@angular/core';
import { SettingsService } from 'settings';
import { ISound } from '../sound.interface';

@Component({
  selector: 'lib-sound-tab-setting',
  templateUrl: './sound-tab-setting.component.html',
  styleUrls: ['./sound-tab-setting.component.css']
})
export class SoundTabSettingComponent {
  switchValue = true;
  readonly settingName: ISound[] = [];

  constructor(
    private readonly _settingsService: SettingsService,
  ) { 
    const value = this._settingsService.settings.value;
    this.switchValue = value?.sound;

    this.settingName = [
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
    this._settingsService.saveSound(this.switchValue);
  }

}
