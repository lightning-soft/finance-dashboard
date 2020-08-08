import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartComponent } from './chart.component';
import { ChartRoutingModule } from './chart-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ChartRoutingModule
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
export class ChartModule { }
