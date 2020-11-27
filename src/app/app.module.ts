import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AccountsManager, AccountsManagerModule } from 'accounts-manager';
import { CommunicationConfig, CommunicationModule } from 'communication';
import { ConfigModule } from 'config';
import { ContextMenuModule } from 'context-menu';
import { FakeCommunicationModule } from 'fake-communication';
import { LayoutModule } from 'layout';
import { LoadingModule } from 'lazy-modules';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { en_US, NzI18nService, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NotifierModule } from 'notifier';
import { RealTradingModule } from 'real-trading';
import { SettingsModule } from 'settings';
import { environment } from 'src/environments/environment';
import { ThemesHandler } from 'themes';
import { WindowManagerModule } from 'window-manager';
import { AppConfig } from './app.config';
import {
  AccountComponent,
  AppComponent, ClockComponent,
  DashboardComponent,
  DragDrawerComponent,
  NavbarComponent,
  NavbarControllerComponent,
  NotificationListComponent, TradeLockComponent
} from './components';
import { Modules, modulesStore } from './modules';
import { FramesManagerComponent } from './components/navbar/frames-manager/frames-manager.component';

export function initAccounts(manager: AccountsManager): () => Promise<any> {
  return () => manager.init();
}


@NgModule({
  declarations: [
    NavbarComponent,
    DashboardComponent,
    DragDrawerComponent,
    AppComponent,
    AccountComponent,
    TradeLockComponent,
    NavbarControllerComponent,
    ClockComponent,
    NotificationListComponent,
    FramesManagerComponent,
  ],
  imports: [
    NzSelectModule,
    HttpClientModule,
    CommunicationModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    NzModalModule,
    BrowserAnimationsModule,
    NotifierModule,
    ContextMenuModule,
    WindowManagerModule,
    SettingsModule.forRoot(),
    ConfigModule.configure({
      path: environment.config || 'config/config.json',
      configClass: AppConfig,
    }),
    AccountsManagerModule.forRoot(),
    CommunicationModule.forRoot([
      {
        provide: CommunicationConfig,
        useExisting: AppConfig,
      }
    ]),
    FakeCommunicationModule.forRoot(),
    RealTradingModule.forRoot(),
    LayoutModule.forRoot(),
    LoadingModule.forRoot([
      {
        path: Modules.Accounts,
        loadChildren: () => import('accounts').then(i => i.AccountsModule)
      },
      {
        path: Modules.Chart,
        loadChildren: () => import('chart').then(i => i.ChartModule)
      },
      {
        path: Modules.Watchlist,
        loadChildren: () => import('watchlist').then(i => i.WatchlistModule)
      },
      {
        path: Modules.Positions,
        loadChildren: () => import('positions').then(i => i.PositionsModule)
      },
      {
        path: Modules.Orders,
        loadChildren: () => import('orders').then(i => i.OrdersModule)
      },
      {
        path: Modules.OrderForm,
        loadChildren: () => import('order-form').then(i => i.OrderFormModule)
      },
      {
        path: Modules.Settings,
        loadChildren: () => import('settings').then(i => i.SettingsModule)
      },
      {
        path: Modules.Scripting,
        loadChildren: () => import('scripting').then(i => i.ScriptingModule)
      }
    ], modulesStore),
    RouterModule.forRoot([
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: '**',
        component: DashboardComponent,
      },
    ]),
    NzDropDownModule,
  ],
  providers: [
    ThemesHandler,
    {
      provide: APP_INITIALIZER,
      useFactory: initAccounts,
      multi: true,
      deps: [AccountsManager],
    },
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private i18n: NzI18nService) {
  }
  switchLanguage(){
    this.i18n.setLocale(en_US);
  }
}
