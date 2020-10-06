import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataGridModule } from 'data-grid';
import { Components, ComponentStore, LazyModule } from 'lazy-modules';
import { WatchlistComponent } from './watchlist.component';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
    FormsModule
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
