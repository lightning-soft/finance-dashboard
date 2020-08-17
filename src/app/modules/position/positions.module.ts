import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DataGridModule, IViewBuilderStore, ViewBuilderStore} from 'data-grid';
import {Components, ComponentStore, LazyModule} from 'lazy-modules';
import {PositionsComponent} from './positions.component';
import {IconComponent, iconComponentSelector} from '../data-grid/models/cells/components/icon-conponent';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule
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
