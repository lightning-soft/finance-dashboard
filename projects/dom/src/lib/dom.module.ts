import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataGridModule } from 'data-grid';
import { DynamicFormModule } from 'dynamic-form';
import { InstrumentSelectModule } from 'instrument-select';
import { ComponentStore, LazyModule } from 'lazy-modules';
import {
    NzCheckboxModule, NzDropDownModule, NzInputModule, NzInputNumberModule,
    NzMenuModule,
    NzPopoverModule,

    NzSelectModule,
    NzToolTipModule
} from 'ng-zorro-antd';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { StorageModule } from 'storage';
import { WindowHeaderModule } from 'window-header';
import { DomFormComponent } from './dom-form/dom-form.component';
import { TypeButtonsComponent } from './dom-form/type-buttons/type-buttons.component';
import { DomSettingsComponent, DomSettingsSelector } from './dom-settings/dom-settings.component';
import { DomComponent } from './dom.component';
import { HistogramComponent } from './histogram';
import { DailyInfoComponent } from './dom-form/daily-info/daily-info.component';
import { AccountSelectModule } from 'account-select';
import { BaseOrderFormModule } from 'base-order-form';

@NgModule({
  declarations: [
    DomComponent,
    DomFormComponent,
    DomSettingsComponent,
    HistogramComponent,
    TypeButtonsComponent,
    DailyInfoComponent,
  ],
    imports: [
        DataGridModule,
        InstrumentSelectModule,
        WindowHeaderModule,
        AccountSelectModule,
        NzInputModule,
        BaseOrderFormModule,
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
        ReactiveFormsModule,
        NzInputNumberModule,
        NzDropDownModule,
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
