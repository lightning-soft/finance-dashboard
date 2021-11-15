import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDropDownModule, NzSelectModule, NzSliderModule } from 'ng-zorro-antd';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { SelectedSoundComponent } from './selected-sound/selected-sound.component';
import { SoundSettingComponent } from './sound-setting/sound-setting.component';
import { SoundTabSettingComponent } from './sound-tab-setting/sound-tab-setting.component';
import { SettingsStore, SoundService } from './sound.service';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ScrollingModule } from '@angular/cdk/scrolling';


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
        NzRadioModule,
        ScrollingModule,
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
        },
      ]
    };
  }
}
