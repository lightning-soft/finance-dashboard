import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenInterceptor } from './token.interceptor';
import { StorageModule } from 'storage';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    StorageModule
  ],
  providers: [
    HttpClientModule,
    AuthService,
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
        AuthService,
      ]
    };
  }
}
