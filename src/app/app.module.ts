import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CommunicationConfig, CommunicationModule } from 'communication';
import { ConfigModule } from 'config';
import { ContextMenuModule } from 'context-menu';
import { FakeCommunicationModule } from 'fake-communication';
import { LayoutModule } from 'layout';
import { LoadingModule } from 'lazy-modules';
import { NzDropDownModule } from 'ng-zorro-antd';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NotifierModule } from 'notifier';
import { environment } from 'src/environments/environment';
import { ThemesHandler } from 'themes';
import { AppConfig } from './app.config';
import { Modules, modulesStore } from './modules';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  AccountComponent,
  ClockComponent,
  AppComponent,
  DashboardComponent,
  DragDrawerComponent,
  NavbarComponent,
  NavbarControllerComponent,
  NotificationListComponent, TradeLockComponent
} from './components';
import { SettingsComponent } from './components/modals/settings/settings.component';

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
    SettingsComponent,
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
    ConfigModule.configure({
      path: environment.config || 'config/config.json',
      configClass: AppConfig,
    }),
    CommunicationModule.forRoot([
      {
        provide: CommunicationConfig,
        useExisting: AppConfig,
      }
    ]),
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
    FakeCommunicationModule.forRoot(),
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
