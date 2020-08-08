import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdersComponent } from './modules/general/orders/orders.component';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: OrdersComponent, },

  {
    path: 'watch',
    loadChildren: () => import('./modules/general/watch/watch.module')
      .then(mod => mod.WatchModule)
  },
  {
    path: 'chart',
    loadChildren: () => import('./modules/general/chart/chart.module')
      .then(mod => mod.ChartModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./modules/general/signin/signin.module')
      .then(mod => mod.SigninModule)
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
