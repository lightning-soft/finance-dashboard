import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {OrdersComponent} from './modules/general/orders/orders.component';
import {NotFoundComponent} from './modules/general/not-found/not-found.component';
import {AppRoutingModule} from './app-routing.module';
import {LayoutComponent} from './layout/layout.component';
import {NavbarComponent} from './navbar/navbar.component';
import {DataGridComponent} from './data-grid/data-grid.component';


@NgModule({
  declarations: [
    AppComponent,
    OrdersComponent,
    NotFoundComponent,
    DataGridComponent,
    LayoutComponent,
    NavbarComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule.withServerTransition({appId: 'serverApp'}),
    AppRoutingModule,
  ],
  providers: [],
  exports: [
    DataGridComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
