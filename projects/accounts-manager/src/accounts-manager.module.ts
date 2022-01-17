import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Injector } from '@angular/core';
import { ConnectionContainer } from 'trading';
import { AccountsManager, RootAccountsManager } from './accounts-manager';
import { HttpErrorInterceptor } from './interceptor';


@NgModule({})
export class AccountsManagerModule {
  static forRoot(): ModuleWithProviders<AccountsManagerModule> {
    return {
      ngModule: AccountsManagerModule,
      providers: [
        {
          provide: RootAccountsManager,
          useClass: AccountsManager,
        },
        {
          provide: AccountsManager,
          useFactory: (injector: Injector) => {
            if (window?.opener == null) {
              window.deps.set('AccountsManager', injector.get(RootAccountsManager));
            }
            return window.deps.get('AccountsManager');
          },
          deps: [Injector],
        },
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
