import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentStore } from 'lazy-modules';
import { NzSelectModule } from 'ng-zorro-antd';
import { WindowHeaderModule } from 'window-header';
import { SettingsStore } from './setting-store';
import { SettingsComponent } from './settings.component';
import { SettignsService } from './settings.service';

@NgModule({
  imports: [
    CommonModule,
    NzSelectModule,
    FormsModule,
    WindowHeaderModule,
  ],
  exports: [
    SettingsComponent,
  ],
  declarations: [
    SettingsComponent,
  ],
  providers: [
    SettignsService,
    SettingsStore,
  ]

})
export class SettingsModule {
  static forRoot(): ModuleWithProviders<SettingsModule> {
    return {
      ngModule: SettingsModule,
      providers: [
        SettignsService,
        SettingsStore,
      ]
    };
  }

  get components(): ComponentStore {
    return {
      settings: SettingsComponent
    };
  }
}
