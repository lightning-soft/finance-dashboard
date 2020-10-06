import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import en from '@angular/common/locales/en';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NavbarComponent, DashboardComponent, AppComponent, DragDrawerComponent } from './components';
import { LayoutModule } from 'layout';
import { LoadingModule } from 'lazy-modules';
import { FakeCommunicationModule } from 'fake-communication';
import { ThemesHandler } from 'themes';
import { NotifierModule } from 'notifier';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { NZ_ICONS } from 'ng-zorro-antd/icon';

registerLocaleData(en);
const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

@NgModule({
  declarations: [
    NavbarComponent,
    DashboardComponent,
    DragDrawerComponent,
    AppComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    NzModalModule,
    BrowserAnimationsModule,
    NotifierModule,
    LayoutModule.forRoot(),
    LoadingModule.forRoot(),
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
  ],
  providers: [
    ThemesHandler,
    { provide: NZ_I18N, useValue: en_US },
    { provide: NZ_ICONS, useValue: icons }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
