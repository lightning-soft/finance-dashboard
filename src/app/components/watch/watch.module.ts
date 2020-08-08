import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchComponent } from './watch.component';
import { WatchRoutingModule } from './watch-routing.module';
import { DataGridModule } from 'data-grid';

@NgModule({
  imports: [
    CommonModule,
    WatchRoutingModule,
    DataGridModule
  ],
  exports: [
    WatchComponent,
  ],
  declarations: [
    WatchComponent,
  ],
  providers: [
  ],
})
export class WatchModule { }
