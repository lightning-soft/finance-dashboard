import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzContextMenuService, NzDropDownModule } from 'ng-zorro-antd';
import { ContextMenuComponent } from './context-menu.component';

@NgModule({
  declarations: [ContextMenuComponent],
  imports: [
    NzDropDownModule,
    CommonModule
  ],
  exports: [ContextMenuComponent],
  providers: [
    NzContextMenuService,
  ],
})
export class ContextMenuModule { }
