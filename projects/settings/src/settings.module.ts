import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { SettingsComponent } from './settings.component';
import { NzSelectModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    NzSelectModule,
    FormsModule,
  ],
  exports: [
    SettingsComponent
  ],
  declarations: [
    SettingsComponent,
  ],

})
export class SettingsModule implements LazyModule {
  get components(): ComponentStore {
    return {
      settings: SettingsComponent
    };
  }
}
