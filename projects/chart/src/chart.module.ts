import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { AccountSelectModule } from 'account-select';
import { BaseOrderFormModule } from 'base-order-form';
import { DataGridModule } from 'data-grid';
import { DataSelectModule } from 'data-select';
import { DynamicFormModule } from 'dynamic-form';
import { InstrumentSelectModule } from 'instrument-select';
import { LazyAssetsModule } from 'lazy-assets';
import { ComponentStore, LazyModule } from 'lazy-modules';
import {
  NzAutocompleteModule,
  NzButtonModule,
  NzCheckboxModule,
  NzCollapseModule,
  NzDropDownModule,
  NzFormModule,
  NzIconModule,
  NzInputModule,
  NzInputNumberModule,
  NzPopoverModule,
  NzSelectModule,
  NzSwitchModule,
  NzToolTipModule
} from 'ng-zorro-antd';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { environment } from 'src/environments/environment';
import { LoaderModule, NullCalescingModule } from 'ui';
import { WindowHeaderModule } from 'window-header';
import { ChartSettingsComponent } from './chart-settings/chart-settings.component';
import { chartSettings } from './chart-settings/settings';
import { ChartComponent } from './chart.component';
import { IndicatorsComponent } from './indicators/indicators.component';
import { RepeatGroupComponent } from './indicators/repeat-group/repeat-group.component';
import { InfoComponent } from './info/info.component';
import { OrdersPanelComponent } from './orders-panel/orders-panel.component';
import { FrameSelectorComponent } from './toolbar/frame-selector/frame-selector.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import {
  customVolumeProfileSettings,
  VolumeProfileCustomSettingsComponent
} from './volume-profile-custom-settings/volume-profile-custom-settings.component';
import { HotkeyInputModule } from 'hotkey-input';
import { TimeframePipe } from './timeframe.pipe';

// const environment = { scxPath: '' };

@NgModule({
  imports: [
    NzPopoverModule,
    CommonModule,
    NzInputModule,
    NzAutocompleteModule,
    FormsModule,
    NzSelectModule,
    NzDropDownModule,
    NullCalescingModule,
    NzButtonModule,
    LoaderModule,
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
          src: `${ environment.scxPath }StockChartX.min.js`,
          charset: 'iso-8859-1'
        }, {
          src: `${ environment.scxPath }StockChartX.UI.min.js`,
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
    DragDropModule,
    ReactiveFormsModule,
    NzInputNumberModule,
    DynamicFormModule,
    ScrollingModule,
    NzSwitchModule,
    NzToolTipModule,
    NzCollapseModule,
    NzCheckboxModule,
    OverlayModule,
    DataSelectModule,
    HotkeyInputModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'repeat-group',
          component: RepeatGroupComponent,
        },
      ],
    }),
  ],
  exports: [
    ChartComponent
  ],
  declarations: [
    ChartComponent,
    ToolbarComponent,
    IndicatorsComponent,
    FrameSelectorComponent,
    OrdersPanelComponent,
    ChartSettingsComponent,
    VolumeProfileCustomSettingsComponent,
    InfoComponent,
    RepeatGroupComponent,
    TimeframePipe,
  ],
})
export class ChartModule implements LazyModule {
  get components(): ComponentStore {
    return {
      chart: ChartComponent,
      indicators: IndicatorsComponent,
      ordersPanel: OrdersPanelComponent,
      [chartSettings]: ChartSettingsComponent,
      [customVolumeProfileSettings]: VolumeProfileCustomSettingsComponent,
    };
  }
}


