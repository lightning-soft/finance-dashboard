import { NgModule } from '@angular/core';
import { WindowHeaderComponent } from './window-header.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [WindowHeaderComponent],
  imports: [
    CommonModule,
  ],
  exports: [WindowHeaderComponent]
})
export class WindowHeaderModule { }
