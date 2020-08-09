import { DataGrid } from './components/data-grid/data-grid.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemViewBuilder } from './components/item-view-builder';

let entryComponents = [
  DataGrid,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ItemViewBuilder,

    ...entryComponents
  ],
  entryComponents,
  exports: entryComponents,
})
export class DataGridModule {
}
