import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd';
import { DataSelectComponent } from './data-select.component';



@NgModule({
  declarations: [DataSelectComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
  ],
  exports: [DataSelectComponent]
})
export class DataSelectModule { }
