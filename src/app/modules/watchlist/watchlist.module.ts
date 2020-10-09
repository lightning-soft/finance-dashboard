import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataGridModule } from 'data-grid';
import { Components, ComponentStore, LazyModule } from 'lazy-modules';
import { WatchlistComponent } from './watchlist.component';
import { SearchSelectModule } from 'search-select';
import { NzDropDownModule, NzContextMenuService } from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
    FormsModule,
    SearchSelectModule,
    NzDropDownModule,
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
    NzContextMenuService
  ],
})
export class WatchlistModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Watchlist]: WatchlistComponent
    };
  }
}
