import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputNumberModule, NzSelectModule } from 'ng-zorro-antd';
import { TimeSelectComponent } from './time-select.component';



@NgModule({
  declarations: [TimeSelectComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzInputNumberModule,
    NzSelectModule,
  ],
  exports: [TimeSelectComponent]
})
export class TimeSelectModule { }
