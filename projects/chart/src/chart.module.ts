import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountSelectModule } from 'account-select';
import { InstrumentSelectModule } from 'instrument-select';
import { LazyAssetsModule } from 'lazy-assets';
import { ComponentStore, LazyModule } from 'lazy-modules';
import {
    NzAutocompleteModule,
    NzButtonModule, NzCheckboxModule,
    NzDropDownModule,
    NzFormModule,
    NzIconModule,
    NzInputModule, NzInputNumberModule,
    NzSelectModule,
    NzSwitchModule, NzToolTipModule
} from 'ng-zorro-antd';
import { environment } from 'src/environments/environment';
import { WindowHeaderModule } from 'window-header';
import { ChartComponent } from './chart.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { WindowToolbarComponent } from './window-toolbar/window-toolbar.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { IndicatorsComponent } from './indicators/indicators.component';
import { DynamicFormModule } from 'dynamic-form';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { IndicatorListComponent } from './indicators/indicator-list/indicator-list.component';
import { BaseOrderFormModule } from 'base-order-form';
import { OrdersPanelComponent } from './orders-panel/orders-panel.component';
import { DataGridModule } from 'data-grid';
import { ConfirmOrderComponent } from './modals/confirm-order/confirm-order.component';

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
        BaseOrderFormModule,
        NzModalModule,
        InstrumentSelectModule,
        DataGridModule,
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
        NzFormModule,
        ReactiveFormsModule,
        NzInputNumberModule,
        DynamicFormModule,
        ScrollingModule,
        NzSwitchModule,
        NzToolTipModule,
        NzCheckboxModule,
    ],
  exports: [
    ChartComponent
  ],
  declarations: [
    ChartComponent,
    ToolbarComponent,
    WindowToolbarComponent,
    IndicatorsComponent,
    IndicatorListComponent,
    OrdersPanelComponent,
    ConfirmOrderComponent,
  ],
  providers: [
  ],
})
export class ChartModule implements LazyModule {
  get components(): ComponentStore {
    return {
      chart: ChartComponent,
      indicators: IndicatorsComponent,
      indicatorList: IndicatorListComponent,
      ordersPanel: OrdersPanelComponent,
    };
  }
}


