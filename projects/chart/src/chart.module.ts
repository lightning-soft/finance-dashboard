import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LazyAssetsModule } from 'lazy-assets';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzAutocompleteModule, NzButtonModule, NzDropDownModule, NzIconModule, NzInputModule, NzSelectModule } from 'ng-zorro-antd';
import { OrderFormModule } from 'order-form';
import { environment } from 'src/environments/environment';
import { ChartComponent } from './chart.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { InstrumentSelectModule } from 'instrument-select';

// const environment = { scxPath: '' };

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
    InstrumentSelectModule,
    LazyAssetsModule.forConfig({
      scripts: [
        {
          src: `${environment.scxPath}StockChartX.min.js`,
          charset: 'iso-8859-1'
        }, {
          src: `${environment.scxPath}StockChartX.UI.min.js`,
          charset: 'iso-8859-1'
        }, {
          src: `./assets/StockChartX/scripts/StockChartX.External.min.js`
        },
      ],
      styles: [
        {
          href: './assets/StockChartX/css/StockChartX.min.css'
        },
        {
          href: './assets/StockChartX/css/StockChartX.UI.min.css'
        },
        {
          href: './assets/StockChartX/css/StockChartX.External.min.css'
        }
      ]
    }),
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
      chart: ChartComponent
    };
  }
}


