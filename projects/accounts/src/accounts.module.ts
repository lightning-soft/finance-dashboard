import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzButtonModule, NzCollapseModule, NzFormModule, NzInputModule, NzSelectModule, NzTabsModule, NzTransferModule } from 'ng-zorro-antd';
import { AccountsComponent } from './accounts.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCollapseModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTabsModule,
    NzTransferModule,
  ],
  exports: [
    AccountsComponent,
  ],
  declarations: [
    AccountsComponent,
  ],
})
export class AccountsModule implements LazyModule {
  get components(): ComponentStore {
    return {
      accounts: AccountsComponent
    };
  }
}
