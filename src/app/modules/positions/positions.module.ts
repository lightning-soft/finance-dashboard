import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DataGridModule } from 'data-grid';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { PositionsComponent } from './positions.component';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
  ],
  exports: [
    PositionsComponent
  ],
  declarations: [
    PositionsComponent,
  ],

})
export class PositionsModule implements LazyModule {
  get components(): ComponentStore {
    return {
      positions: PositionsComponent
    };
  }
}
