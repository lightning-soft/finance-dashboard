import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AccountsManager, AccountsManagerModule } from 'accounts-manager';
import { AuthModule, AuthService } from 'auth';
import { CommunicationConfig, CommunicationModule } from 'communication';
import { FramesManagerComponent } from './components/navbar/frames-manager/frames-manager.component';
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
import { first } from 'rxjs/operators';
import { SettingsModule } from 'settings';
import { environment } from 'src/environments/environment';
import { ThemesHandler } from 'themes';
import { WindowManagerModule } from 'window-manager';
import { AppConfig } from './app.config';
import {
  AccountComponent,
  AppComponent, ClockComponent,
  ConnectionsComponent,
  DashboardComponent,
  DragDrawerComponent,
  NavbarComponent,
  NavbarControllerComponent,
  NotificationListComponent, TradeLockComponent
} from './components';
import { Modules, modulesStore } from './modules';
import { DomModule } from '../../projects/dom/src/lib/dom.module';



/**
 *  Move declaration to enother file
 */
function generateLoginLink(config): string {

  const { clientId, responseType, scope, redirectUri } = config;

  const data = new URLSearchParams();

  data.set('client_id', clientId);
  data.set('response_type', responseType);
  data.set('scope', scope.join(' '));
  data.set('redirect_uri', redirectUri);

  return `${config.url}connect/authorize?${data.toString()}`;
}

async function initAccounts(manager: AccountsManager) {
  return manager.init();
}

async function initIdentityAccount(authService: AuthService, config: AppConfig) {
  const queryParams = new URLSearchParams(window.location.search);
  const code = queryParams.get('code');

  if (code)
    window.history.replaceState(null, null, '/');
  else {
    location.replace( generateLoginLink(config.identity) );
  }

  return authService.initialize(code);
}

export function initApp(config: AppConfig, manager: AccountsManager, authService: AuthService) {
  return  async () => {
    await config.getConfig().pipe(first()).toPromise();
    // await initIdentityAccount(authService, config);
    await initAccounts(manager);
  };
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
    ConnectionsComponent,
    FramesManagerComponent,
  ],
  imports: [
    NzSelectModule,
    HttpClientModule,
    CommunicationModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    NzModalModule,
    NzDropDownModule,
    ScrollingModule,
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
    AuthModule.forRoot(),
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
      },
      {
        path: Modules.Dom,
        loadChildren: () => import('dom').then(i => i.DomModule)
      },
    ], modulesStore),
    RouterModule.forRoot([
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: '**',
        component: DashboardComponent,
      }
    ]),
    NzDropDownModule,
  ],
  providers: [
    ThemesHandler,
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
      deps: [
        AppConfig,
        AccountsManager,
        AuthService
      ],
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
