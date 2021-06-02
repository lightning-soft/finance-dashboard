import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContextMenuModule } from 'context-menu';
import { DataGridModule } from 'data-grid';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzContextMenuService, NzDropDownModule } from 'ng-zorro-antd';
import { SearchSelectModule } from 'search-select';
import { WatchlistComponent } from './watchlist.component';
import { InstrumentSelectModule } from 'instrument-select';
import { WindowHeaderModule } from 'window-header';
import { LoaderModule } from "ui";

@NgModule({
    imports: [
        CommonModule,
        DataGridModule,
        FormsModule,
        SearchSelectModule,
        NzDropDownModule,
        ContextMenuModule,
        InstrumentSelectModule,
        WindowHeaderModule,
        LoaderModule,
    ],
  exports: [
    WatchlistComponent,
  ],
  declarations: [
    WatchlistComponent,
  ],
  entryComponents: [
  ],
  providers: [
    NzContextMenuService
  ],
})
export class WatchlistModule implements LazyModule {
  get components(): ComponentStore {
    return {
      watchlist: WatchlistComponent
    };
  }
}
