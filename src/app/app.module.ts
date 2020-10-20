import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NavbarComponent, DashboardComponent, AppComponent, DragDrawerComponent } from './components';
import { RouterModule } from '@angular/router';
import { LayoutModule } from 'layout';
import { LoadingModule } from 'lazy-modules';
import { FakeCommunicationModule } from 'fake-communication';
import { ThemesHandler } from 'themes';
import {NzDropDownModule} from 'ng-zorro-antd';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    NavbarComponent,
    DashboardComponent,
    DragDrawerComponent,
    AppComponent,
  ],
    imports: [
        HttpClientModule,
        BrowserModule.withServerTransition({appId: 'serverApp'}),
        NzModalModule,
        BrowserAnimationsModule,
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
        NzDropDownModule,
    ],
  providers: [
    ThemesHandler,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
