import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountSelectModule } from 'account-select';
import { InstrumentSelectModule } from 'instrument-select';
import { LazyAssetsModule } from 'lazy-assets';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzAutocompleteModule, NzButtonModule, NzDropDownModule, NzIconModule, NzInputModule, NzSelectModule } from 'ng-zorro-antd';
import { OrderFormModule } from 'order-form';
import { environment } from 'src/environments/environment';
import { WindowHeaderModule } from 'window-header';
import { ChartComponent } from './chart.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { WindowToolbarComponent } from './window-toolbar/window-toolbar.component';

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
    WindowHeaderModule,
    AccountSelectModule,
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
        {
          src: './assets/StockChartX/scripts/html2canvas.min.js'
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
    ToolbarComponent,
    WindowToolbarComponent,
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


