import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DataGridModule } from 'data-grid';
import { Components, ComponentStore, LazyModule } from 'lazy-modules';
import { WatchlistComponent } from './watchlist.component';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule
  ],
  exports: [
    WatchlistComponent,
  ],
  declarations: [
    WatchlistComponent,
  ],
  entryComponents:[
  ],
  providers: [
  ],
})
export class WatchlistModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Watchlist]: WatchlistComponent
    };
  }
}
