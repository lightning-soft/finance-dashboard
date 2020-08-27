import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DataGridModule} from 'data-grid';
import {Components, ComponentStore, LazyModule} from 'lazy-modules';
import {PositionsComponent} from './positions.component';
import {NotifierModule} from '../ui';

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
      [Components.Positions]: PositionsComponent
    };
  }
}
