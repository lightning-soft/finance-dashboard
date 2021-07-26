import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SoundComponent } from './sound.component';
import { SoundTabSettingComponent } from './sound-tab-setting/sound-tab-setting.component';
import { SoundSettingComponent } from './sound-setting/sound-setting.component';
import { SelectedSoundComponent } from './selected-sound/selected-sound.component';
import { CommonModule } from '@angular/common';
import { NzDropDownModule, NzSelectModule, NzSliderModule } from 'ng-zorro-antd';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [SoundComponent, SoundTabSettingComponent, SoundSettingComponent, SelectedSoundComponent],
  imports: [
    CommonModule,
    NzSelectModule,
    NzSliderModule,
    NzDropDownModule,
    NzSwitchModule,
    FormsModule, 
    ReactiveFormsModule 
  ],
  exports: [SoundComponent, SoundTabSettingComponent],
  // schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SoundModule { }
