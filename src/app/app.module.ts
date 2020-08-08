import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { OrdersComponent } from './modules/general/orders/orders.component';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';
import { AppRoutingModule } from './app-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AddComponentComponent } from './modules/general/add-component/add-component.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzModalModule } from 'ng-zorro-antd/modal';
// import { DataGridComponent } from 'data-grid';

@NgModule({
  declarations: [
    AppComponent,
    OrdersComponent,
    NotFoundComponent,
    LayoutComponent,
    AddComponentComponent,
    NavbarComponent
  ],
  entryComponents: [AddComponentComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    NzModalModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
