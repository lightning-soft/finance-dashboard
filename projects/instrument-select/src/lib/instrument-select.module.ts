import { NgModule } from '@angular/core';
import { InstrumentSelectComponent } from './instrument-select.component';
import { NzAutocompleteModule } from 'ng-zorro-antd';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    InstrumentSelectComponent,
  ],
  imports: [
    CommonModule,
    NzAutocompleteModule,
    FormsModule,
  ],
  exports: [
    InstrumentSelectComponent,
  ]
})
export class InstrumentSelectModule { }
