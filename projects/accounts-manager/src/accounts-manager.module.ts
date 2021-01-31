import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { AccountsManager } from './accounts-manager';
import { HttpErrorInterceptor } from './interceptor';

@NgModule({})
export class AccountsManagerModule {
  static forRoot(): ModuleWithProviders<AccountsManagerModule> {
    return {
      ngModule: AccountsManagerModule,
      providers: [
        AccountsManager,
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
