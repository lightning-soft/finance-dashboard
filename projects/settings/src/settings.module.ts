import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentStore } from 'lazy-modules';
import { NzRadioModule, NzSelectModule } from 'ng-zorro-antd';
import { WindowHeaderModule } from 'window-header';
import { SettingsStore } from './setting-store';
import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';

@NgModule({
  imports: [
    CommonModule,
    NzSelectModule,
    FormsModule,
    WindowHeaderModule,
    NzRadioModule,
  ],
  exports: [
    SettingsComponent,
  ],
  declarations: [
    SettingsComponent,
  ],
})
export class SettingsModule {
  static forRoot(): ModuleWithProviders<SettingsModule> {
    return {
      ngModule: SettingsModule,
      providers: [
        SettingsService,
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
