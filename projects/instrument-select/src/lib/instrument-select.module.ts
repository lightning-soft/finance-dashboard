import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InstrumentSelectComponent } from './instrument-select.component';
import { NzSelectModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [
    InstrumentSelectComponent,
  ],
  imports: [
    CommonModule,
    NzSelectModule,
    FormsModule,
  ],
  exports: [
    InstrumentSelectComponent,
  ]
})
export class InstrumentSelectModule { }
