import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './modules/general/home/home.component';
import { NotFoundComponent } from './modules/general/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent, },

  {
    path: 'about',
    loadChildren: () => import('./modules/general/about/about.module')
      .then(mod => mod.AboutModule)
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
