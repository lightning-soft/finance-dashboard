import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentStore, LazyModule } from 'lazy-modules';
import {
    NzButtonModule,
    NzCollapseModule, NzDropDownModule,
    NzFormModule, NzIconModule,
    NzInputModule,
    NzPopoverModule,
    NzSelectModule, NzSwitchModule,
    NzTabsModule,
    NzTransferModule
} from 'ng-zorro-antd';
import { WindowHeaderModule } from 'window-header';
import { AccountsComponent } from './accounts.component';
import { AccountFormComponent } from './account-form/account-form.component';
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
        NzDropDownModule,
    ],
  exports: [
    AccountsComponent,
  ],
  declarations: [
    AccountsComponent,
    AccountFormComponent,
  ],
})
export class AccountsModule implements LazyModule {
  get components(): ComponentStore {
    return {
      accounts: AccountsComponent
    };
  }
}
