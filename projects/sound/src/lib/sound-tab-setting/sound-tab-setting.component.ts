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
    public readonly settingsService: SettingsService,
  ) { 
    const value = this.settingsService.settings.value;

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

}
