import { NgModule } from '@angular/core';
import { DomComponent } from './dom.component';
import { DataGridModule } from 'data-grid';
import { LazyModule, ComponentStore } from 'lazy-modules';
import { WindowHeaderModule } from 'window-header';
import { InstrumentSelectModule } from '../../../instrument-select/src/lib/instrument-select.module';
import { DomSettingsComponent } from './dom-settings/dom-settings.component';
import { NzMenuModule } from 'ng-zorro-antd';
import { DynamicFormModule } from 'dynamic-form';
import { CommonModule } from '@angular/common';
import { StorageModule } from 'storage';

@NgModule({
  declarations: [
    DomComponent,
    DomSettingsComponent,
  ],
  imports: [
    DataGridModule,
    InstrumentSelectModule,
    WindowHeaderModule,
    NzMenuModule,
    DynamicFormModule,
    StorageModule,
    CommonModule,
  ],
  exports: [
    DomComponent,
  ]
})
export class DomModule implements LazyModule {
  get components(): ComponentStore {
    return {
      dom: DomComponent,
    };
  }
}
