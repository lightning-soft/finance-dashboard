import { NgModule } from '@angular/core';
import { InstrumentDialogComponent } from './instrument-dialog.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from "@angular/cdk/scrolling";

@NgModule({
  declarations: [InstrumentDialogComponent],
  imports: [
    CommonModule,
    NzInputModule,
    NzTabsModule,
    NzFormModule,
    ReactiveFormsModule,
    ScrollingModule,
  ],
  exports: [InstrumentDialogComponent]
})
export class InstrumentDialogModule { }
