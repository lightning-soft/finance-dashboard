import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from 'layout';
import { LoadingModule } from 'lazy-modules';
import { FakeCommunicationModule } from 'fake-communication';
import { ThemesHandler } from 'themes';
import { NotifierModule } from 'notifier';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NavbarComponent, DashboardComponent, AppComponent, DragDrawerComponent } from './components';

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
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
