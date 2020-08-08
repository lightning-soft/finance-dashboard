import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NavbarComponent, DashboardComponent, AppComponent } from './components';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavbarComponent,
    DashboardComponent,
    AppComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    NzModalModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: '**',
        component: DashboardComponent,
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
