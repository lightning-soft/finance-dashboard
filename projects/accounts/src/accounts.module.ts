import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentStore, LazyModule } from 'lazy-modules';
import {
  NzButtonModule,
  NzCollapseModule,
  NzFormModule, NzIconModule,
  NzInputModule,
  NzPopoverModule,
  NzSelectModule, NzSwitchModule,
  NzTabsModule,
  NzTransferModule
} from 'ng-zorro-antd';
import { WindowHeaderModule } from 'window-header';
import { AccountsComponent } from './accounts.component';
import { AcccountFormComponent, ServersRepository } from './acccount-form/acccount-form.component';
import { EyeOutline, EyeInvisibleOutline } from '@ant-design/icons-angular/icons';
import { SearchSelectModule } from 'search-select';

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
    ScrollingModule,
    WindowHeaderModule,
    NzPopoverModule,
    NzSwitchModule,
    FormsModule,
    NzIconModule.forChild([EyeOutline, EyeInvisibleOutline]),
    SearchSelectModule,
  ],
  exports: [
    AccountsComponent,
  ],
  providers: [ServersRepository],
  declarations: [
    AccountsComponent,
    AcccountFormComponent,
  ],
})
export class AccountsModule implements LazyModule {
  get components(): ComponentStore {
    return {
      accounts: AccountsComponent
    };
  }
}
