import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataGridModule } from 'data-grid';
import { ComponentStore, LazyModule } from 'lazy-modules';
import { NzDropDownModule, NzRadioModule, NzSelectModule } from 'ng-zorro-antd';
import { PositionsComponent } from './positions.component';
import { LayoutModule } from 'layout';
import { WindowHeaderModule } from 'window-header';
import { PositionsFeed, TradeDataFeed } from 'trading';
import { RealPositionsFeed, RealTradeDataFeed } from 'real-trading';

@NgModule({
  imports: [
    CommonModule,
    DataGridModule,
    NzSelectModule,
    ReactiveFormsModule,
    LayoutModule,
    WindowHeaderModule,
    NzDropDownModule,
    NzRadioModule,
    FormsModule,
  ],
  exports: [
    PositionsComponent
  ],
  declarations: [
    PositionsComponent,
  ],
  providers: [
    {
      provide: PositionsFeed,
      useClass: RealPositionsFeed,
    },
    {
      provide: TradeDataFeed,
      useClass: RealTradeDataFeed,
    },
  ],

})
export class PositionsModule implements LazyModule {
  get components(): ComponentStore {
    return {
      positions: PositionsComponent
    };
  }
}
