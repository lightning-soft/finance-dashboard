import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDropDownModule, NzSelectModule, NzSliderModule } from 'ng-zorro-antd';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { SelectedSoundComponent } from './selected-sound/selected-sound.component';
import { SoundSettingComponent } from './sound-setting/sound-setting.component';
import { SoundTabSettingComponent } from './sound-tab-setting/sound-tab-setting.component';
import { SoundService, SettingsStore } from './sound.service';



@NgModule({
  declarations: [SoundTabSettingComponent, SoundSettingComponent, SelectedSoundComponent],
  imports: [
    CommonModule,
    NzSelectModule,
    NzSliderModule,
    NzDropDownModule,
    NzSwitchModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [SoundTabSettingComponent]
})
export class SoundModule {

  static forRoot(settingsStore: any): ModuleWithProviders<SoundModule> {
    return {
      ngModule: SoundModule,
      providers: [
        SoundService,
        {
          provide: SettingsStore,
          useExisting: settingsStore,
        }
      ]
    };
  }
}
