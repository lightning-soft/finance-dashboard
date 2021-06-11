import { NgModule } from '@angular/core';
import { RenameModalComponent } from './rename-modal/rename-modal.component';
import { CreateModalComponent } from './create-modal/create-modal.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule, NzInputModule, NzModalModule, NzSelectModule } from 'ng-zorro-antd';

const components = [RenameModalComponent, CreateModalComponent, ConfirmModalComponent];

@NgModule({
  declarations: [components],
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzModalModule,
    ReactiveFormsModule,
    NzSelectModule,
  ],
  providers: [],
  exports: components
})
export class ModalsModule {
}
