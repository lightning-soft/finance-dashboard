import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Injector } from '@angular/core';
import { AuthService, RootAuthService } from './auth.service';
import { TokenInterceptor } from './token.interceptor';
import { StorageModule } from 'storage';
import { CommonModule } from '@angular/common';


function authServiceFactory(injector: Injector) {
  if (!window.deps.get('AuthService')) {
    window.deps.set('AuthService', injector.get(RootAuthService));
  }
  return window.deps.get('AuthService');
}

@NgModule({
  imports: [
    CommonModule,
    StorageModule,
  ],
  providers: [
    HttpClientModule,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
})
export class AuthModule {
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        {
          provide: RootAuthService,
          useClass: AuthService
        },
        {
          provide: AuthService,
          useFactory: authServiceFactory,
          deps: [Injector]
        }
      ]
    };
  }
}
