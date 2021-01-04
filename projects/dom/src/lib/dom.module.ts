import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DataGridModule } from 'data-grid';
import { DynamicFormModule } from 'dynamic-form';
import { InstrumentSelectModule } from 'instrument-select';
import { ComponentStore, LazyModule } from 'lazy-modules';
import {
  NzInputModule,
  NzMenuModule,
  NzPopoverModule,
  NzCheckboxModule,
  NzSelectModule,
  NzToolTipModule
} from 'ng-zorro-antd';
import { StorageModule } from 'storage';
import { WindowHeaderModule } from 'window-header';
import { DomSettingsSelector, DomSettingsComponent } from './dom-settings/dom-settings.component';
import { DomComponent } from './dom.component';
import { HistogramComponent } from './histogram';
import { DomFormComponent } from './dom-form/dom-form.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from "@angular/forms";
import { CssApplier } from './css.applier';

@NgModule({
  declarations: [
    DomComponent,
    DomFormComponent,
    DomSettingsComponent,
    HistogramComponent,
  ],
  imports: [
    DataGridModule,
    InstrumentSelectModule,
    WindowHeaderModule,
    NzInputModule,
    NzButtonModule,
    CommonModule,
    NzPopoverModule,
    NzCheckboxModule,
    NzSelectModule,
    NzMenuModule,
    DynamicFormModule,
    ScrollingModule,
    StorageModule,
    CommonModule,
    FormsModule,
    NzToolTipModule,
  ],
  exports: [
    DomComponent,
  ]
})
export class DomModule implements LazyModule {
  get components(): ComponentStore {
    return {
      dom: DomComponent,
      [DomSettingsSelector]: DomSettingsComponent,
    };
  }
}
