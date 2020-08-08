import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Components, ComponentStore, LazyModule } from 'lazy-modules';
import { ChartComponent } from './chart.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
    ChartComponent
  ],
  declarations: [
    ChartComponent
  ],
  providers: [
  ],
})
export class ChartModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Chart]: ChartComponent
    }
  }
}


