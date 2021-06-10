import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ConnectionContainer } from 'trading';
import { AccountsManager } from './accounts-manager';
import { HttpErrorInterceptor } from './interceptor';

@NgModule({})
export class AccountsManagerModule {
  static forRoot(): ModuleWithProviders<AccountsManagerModule> {
    return {
      ngModule: AccountsManagerModule,
      providers: [
        AccountsManager,
        {
          provide: ConnectionContainer,
          useExisting: AccountsManager,
        },
        HttpErrorInterceptor,
        {
          provide: HTTP_INTERCEPTORS,
          useExisting: HttpErrorInterceptor,
          multi: true
        }
      ],
    };
  }
}
