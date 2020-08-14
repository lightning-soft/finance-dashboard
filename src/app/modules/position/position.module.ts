import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DataGridModule } from 'data-grid';
import { Components, ComponentStore, LazyModule } from 'lazy-modules';
import { PositionComponent } from './position.component';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule
  ],
  exports: [
    PositionComponent
  ],
  declarations: [
    PositionComponent
  ],
})
export class PositionModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Position]: PositionComponent
    };
  }
}
