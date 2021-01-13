import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataGridModule } from 'data-grid';
import { DynamicFormModule } from 'dynamic-form';
import { InstrumentSelectModule } from 'instrument-select';
import { ComponentStore, LazyModule } from 'lazy-modules';
import {
  NzCheckboxModule, NzInputModule,
  NzMenuModule,
  NzPopoverModule,

  NzSelectModule,
  NzToolTipModule
} from 'ng-zorro-antd';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { StorageModule } from 'storage';
import { WindowHeaderModule } from 'window-header';
import { DomFormComponent } from './dom-form/dom-form.component';
import { QuantityInputComponent } from './dom-form/quantity-input/quantity-input.component';
import { SlUnitsComponent } from './dom-form/sl-units/sl-units.component';
import { TpUnitsComponent } from "./dom-form/tp-units/tp-units.component";
import { TypeButtonsComponent } from './dom-form/type-buttons/type-buttons.component';
import { DomSettingsComponent, DomSettingsSelector } from './dom-settings/dom-settings.component';
import { DomComponent } from './dom.component';
import { HistogramComponent } from './histogram';
import { DailyInfoComponent } from './dom-form/daily-info/daily-info.component';

@NgModule({
  declarations: [
    DomComponent,
    DomFormComponent,
    DomSettingsComponent,
    HistogramComponent,
    QuantityInputComponent,
    TypeButtonsComponent,
    SlUnitsComponent,
    TpUnitsComponent,
    DailyInfoComponent
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
        ReactiveFormsModule,
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
