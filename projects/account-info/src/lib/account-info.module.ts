import { NgModule } from '@angular/core';
import { AccountInfoComponent } from './account-info.component';
import { CommonModule } from '@angular/common';
import { LazyModule } from 'lazy-modules';
import { WindowHeaderModule } from 'window-header';
import { DataGridModule } from 'data-grid';


@NgModule({
  declarations: [AccountInfoComponent],
  imports: [
    CommonModule,
    DataGridModule,
    WindowHeaderModule,
  ],
  exports: [AccountInfoComponent]
})
export class AccountInfoModule implements LazyModule {
  get components() {
    return { 'account-info': AccountInfoComponent };
  }
}
