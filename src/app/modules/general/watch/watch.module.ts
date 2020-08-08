import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WatchComponent } from './watch.component';
import { WatchRoutingModule } from './watch-routing.module';
import {AppModule} from '../../../app.module';

@NgModule({
  imports: [
    CommonModule,
    WatchRoutingModule,
    AppModule
  ],
  exports: [
    WatchComponent
  ],
  declarations: [
    WatchComponent
  ],
  providers: [
  ],
})
export class WatchModule { }
