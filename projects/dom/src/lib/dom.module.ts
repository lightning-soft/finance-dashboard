import { NgModule } from '@angular/core';
import { DomComponent } from './dom.component';
import { DataGridModule } from 'data-grid';
import { LazyModule, ComponentStore } from 'lazy-modules';
import { WindowHeaderModule } from 'window-header';
import { InstrumentSelectModule } from '../../../instrument-select/src/lib/instrument-select.module';
import { DomFormComponent } from './dom-form/dom-form.component';
import { NzButtonModule, NzCheckboxModule, NzInputModule, NzPopoverModule, NzSelectModule } from "ng-zorro-antd";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    DomComponent,
    DomFormComponent,
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
