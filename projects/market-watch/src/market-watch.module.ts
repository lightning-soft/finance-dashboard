import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContextMenuModule } from 'context-menu';
import { DataGridModule } from 'data-grid';
import { ComponentStore, LazyModule } from 'lazy-modules';
import {
  NzButtonModule,
  NzContextMenuService,
  NzDropDownModule,
  NzInputModule,
  NzInputNumberModule,
  NzSelectModule,
  NzSpinModule
} from 'ng-zorro-antd';
import { InstrumentSelectModule } from 'instrument-select';
import { WindowHeaderModule } from 'window-header';
import { MarketWatchComponent } from './market-watch.component';
import {
  MarketWatchSettings,
  MarketWatchSettingsComponent
} from './market-watch-settings/market-watch-settings.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DynamicFormModule } from 'dynamic-form';
import { InstrumentDialogModule } from 'instrument-dialog';
import { AccountSelectModule } from 'account-select';
import { SelectWrapperComponent } from './select-wrapper/select-wrapper.component';
import { InputWrapperComponent } from './input-wrapper/input-wrapper.component';
import { NumberWrapperComponent } from './number-wrapper/number-wrapper.component';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
    InstrumentDialogModule,
    FormsModule,
    AccountSelectModule,
    NzInputModule,
    NzDropDownModule,
    ContextMenuModule,
    InstrumentSelectModule,
    WindowHeaderModule,
    ScrollingModule,
    DynamicFormModule,
    NzButtonModule,
    NzSelectModule,
    NzInputNumberModule,
    NzSpinModule,
  ],
  exports: [
    MarketWatchComponent,
  ],
  declarations: [
    MarketWatchComponent,
    MarketWatchSettingsComponent,
    SelectWrapperComponent,
    InputWrapperComponent,
    NumberWrapperComponent,
  ],
  entryComponents: [
    SelectWrapperComponent,
    InputWrapperComponent,
  ],
  providers: [
    NzContextMenuService
  ],
})
export class MarketWatchModule implements LazyModule {
  get components(): ComponentStore {
    return {
      marketWatch: MarketWatchComponent,
      [MarketWatchSettings]: MarketWatchSettingsComponent
    };
  }
}
