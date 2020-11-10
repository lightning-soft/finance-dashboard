import { ModuleWithProviders, NgModule } from '@angular/core';
import { AccountsManager } from './accounts-manager';

@NgModule({})
export class AccountsManagerModule {
  static forRoot(): ModuleWithProviders<AccountsManagerModule> {
    return {
      ngModule: AccountsManagerModule,
      providers: [
        AccountsManager,
      ],
    };
  }
}
