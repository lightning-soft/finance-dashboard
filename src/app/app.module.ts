import { ScrollingModule } from '@angular/cdk/scrolling';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule, NgZone } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AccountsManager, AccountsManagerModule } from 'accounts-manager';
import { AuthModule, AuthService } from 'auth';
import { VolumeProfileTemplatesRepository } from 'chart';
import { CacheInterceptor, CommunicationConfig, CommunicationModule } from 'communication';
import { ConfigModule } from 'config';
import { ContextMenuModule } from 'context-menu';
import { FakeCommunicationModule } from 'fake-communication';
import { LayoutModule, WindowPopupManager } from 'layout';
import { LoadingModule } from 'lazy-modules';
import {
  NzCheckboxModule,
  NzDividerModule,
  NzFormModule,
  NzInputModule,
  NzRadioModule,
  NzTooltipBaseDirective,
  NzToolTipModule
} from 'ng-zorro-antd';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { en_US, NZ_I18N, NzI18nService } from 'ng-zorro-antd/i18n';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NotificationModule } from 'notification';
import { RealTradingModule } from 'real-trading';
import { first } from 'rxjs/operators';
import { SettingsModule } from 'settings';
import { environment } from 'src/environments/environment';
import { TemplatesModule } from 'templates';
import { ThemesHandler } from 'themes';
import { TimezonesClockModule } from 'timezones-clock';
import { ModalsModule, SaveLoaderModule } from 'ui';
import { WindowManagerModule } from 'window-manager';
import { WorkspacesModule } from 'workspace-manager';
import { AppConfig } from './app.config';
import {
  AccountComponent,
  AppComponent,
  ConnectionsComponent,
  DashboardComponent,
  DragDrawerComponent,
  NavbarComponent,
  NavbarControllerComponent,
  TradeLockComponent,
  WindowsComponent
} from './components';
import { FramesManagerComponent } from './components/navbar/frames-manager/frames-manager.component';
import { WorkspaceComponent } from './components/navbar/workspace/workspace.component';
import { Modules, modulesStore } from './modules';
import { ItemsStoreModule } from '../../projects/items-store/src/lib/items-store.module';
import { InstrumentsRepository } from '../../projects/trading/src/trading/repositories/instruments.repository';

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

async function initIdentityAccount(authService: AuthService, config: AppConfig, windowPopupManager: WindowPopupManager) {
  const queryParams = new URLSearchParams(window.location.search);
  const code = queryParams.get('code');

  if (code) {
    window.history.replaceState({}, document.title, '/');
    return authService.initialize(code);
  } else {
    await authService.refreshToken().toPromise()
      .catch(err => {
        if (windowPopupManager.isPopup())
          window.close();
        else
          navigateToIdentity(config.identity);
      });

    if (!authService.isAuthorized) {
      if (windowPopupManager.isPopup())
        window.close();
      else
        navigateToIdentity(config.identity);
    }
  }
}

function navigateToIdentity(config) {
  const isOnline = window.navigator.onLine;

  if (isOnline)
    location.replace(generateLoginLink(config));
}

export function initApp(injector: Injector,
                        config: AppConfig, manager: AccountsManager, authService: AuthService, windowPopupManager: WindowPopupManager) {
  return async () => {
    window.injector = injector;
    await config.getConfig().pipe(first()).toPromise();
    await initIdentityAccount(authService, config, windowPopupManager);

    // avoid initializing because of shared instances
    if (window.opener)
      return;

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
    WindowsComponent,
    NavbarControllerComponent,
    ConnectionsComponent,
    FramesManagerComponent,
    WorkspaceComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzRadioModule,
    ModalsModule,
    HttpClientModule,
    CommunicationModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    SaveLoaderModule,
    NzModalModule,
    NzDropDownModule,
    ScrollingModule,
    BrowserAnimationsModule,
    ContextMenuModule,
    WorkspacesModule,
    WindowManagerModule,
    TimezonesClockModule,
    SettingsModule.forRoot(),
    TemplatesModule.forRoot(),
    ConfigModule.configure({
      path: environment.config || 'config/config.json',
      configClass: AppConfig,
    }),
    AccountsManagerModule.forRoot(),
    CommunicationModule.forRoot([
      {
        provide: CommunicationConfig,
        useExisting: AppConfig,
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: CacheInterceptor,
        multi: true
      }
    ]),
    FakeCommunicationModule.forRoot(),
    RealTradingModule.forRoot(),
    LayoutModule.forRoot(),
    AuthModule.forRoot(),
    NotificationModule.forRoot(),
    LoadingModule.forRoot([
      {
        path: Modules.NotificationList,
        loadChildren: () => import('notification-list').then(i => i.NotificationListModule)
      },
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
      {
        path: Modules.SessionManager,
        loadChildren: () => import('session-manager').then(i => i.SessionManagerModule)
      },
      {
        path: Modules.MarketWatch,
        loadChildren: () => import('market-watch').then(i => i.MarketWatchModule)
      },
      {
        path: Modules.AccountInfo,
        loadChildren: () => import('account-info').then(i => i.AccountInfoModule),
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
      }
    ]),
    NzDropDownModule,
    NzToolTipModule,
    NzCheckboxModule,
    NzInputModule,
    NzDividerModule,
    ItemsStoreModule.forRoot(injector => ({
      instruments: injector.get(InstrumentsRepository),
    }))
  ],
  providers: [
    ThemesHandler,
    VolumeProfileTemplatesRepository,
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
      deps: [
        Injector,
        AppConfig,
        AccountsManager,
        AuthService,
        WindowPopupManager,
      ],
    },
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private i18n: NzI18nService, zone: NgZone, private _appConfig: AppConfig) {

    /*
    / For performance reason avoiding ng zone in some cases
    */
    // Element.prototype.addEventListener = function (...args) {
    //   const _this = this;
    //   const fn = args[1];
    //   if (typeof fn == 'function')
    //     args[1] = (...params) => zone.runOutsideAngular(() => fn.apply(_this, params));

    //   return addEventListener.apply(_this, args);
    // };

    const show = NzTooltipBaseDirective.prototype.show;
    NzTooltipBaseDirective.prototype.show = function (...args) {
      const _this = this;
      zone.run(() => show.apply(_this, args));
    };
  }

  setConfig(config) {
    this._appConfig.apply(config);
  }

  switchLanguage() {
    this.i18n.setLocale(en_US);
  }
}
