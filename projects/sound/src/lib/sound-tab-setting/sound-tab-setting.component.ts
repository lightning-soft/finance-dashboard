import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Inject } from '@angular/core';
import { SoundSetting } from '../sound-setting/sound-setting.component';
import { ISound } from '../sound.interface';
import { SettingsStore } from '../sound.service';

@Component({
  selector: 'lib-sound-tab-setting',
  templateUrl: './sound-tab-setting.component.html',
  styleUrls: ['./sound-tab-setting.component.css'],
})
export class SoundTabSettingComponent {
  switchValue = true;
  settings: ISound[] = [];

  constructor(@Inject(SettingsStore) private readonly _settingsStore: any) {
    this.Onload();
  }

  Onload() {
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

  Turnoffalertbydefault() {
    var Name = '';
    var SelectedSound = '';
    var Volume = 0;
    this.settings.forEach(function (item, index) {
      if (item.name === 'Alert') {
        Name = item.name;
        SelectedSound = item.selectedSound;
        Volume = item.volume;
      }
    });

    let name = Name;
    const checked = false;
    const selectedSound = SelectedSound;
    const volume = Volume;
    const value1: ISound = { name, checked, selectedSound, volume };
    name = name.charAt(0).toLowerCase() + name.slice(1);
    name = name.replace(' ', '');
    this._settingsStore.saveSounds(name, value1);
  }

  save(): void {
    this.Turnoffalertbydefault();
    this._settingsStore.saveSounds(SoundSetting.IS_PLAY, this.switchValue);
    this.Onload();
  }
}
