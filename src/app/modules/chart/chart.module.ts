import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Components, ComponentStore, LazyModule } from 'lazy-modules';
import { ChartComponent } from './chart.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { NzAutocompleteModule, NzButtonModule, NzDropDownModule, NzIconModule, NzInputModule, NzSelectModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { OrderFormModule } from 'order-form';

@NgModule({
    imports: [
        CommonModule,
        NzInputModule,
        NzAutocompleteModule,
        FormsModule,
        NzSelectModule,
        NzDropDownModule,
        NzButtonModule,
        NzIconModule,
        OrderFormModule,
    ],
  exports: [
    ChartComponent
  ],
  declarations: [
    ChartComponent,
    ToolbarComponent
  ],
  providers: [
  ],
})
export class ChartModule implements LazyModule {
  get components(): ComponentStore {
    return {
      [Components.Chart]: ChartComponent
    };
  }
}


