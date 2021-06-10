import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd';
import { AccountSelectComponent } from './account-select.component';


@NgModule({
  declarations: [AccountSelectComponent],
  imports: [
    CommonModule,
    NzSelectModule,
    FormsModule,
  ],
  exports: [AccountSelectComponent]
})
export class AccountSelectModule { }
