import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { DataGrid } from './components/data-grid/data-grid.component';
import { ItemViewBuilder } from './components/item-view-builder';
import { ResizableModule } from './components/resizable/resizable.module';
import { IconComponent } from './models/cells/components/icon-conponent';
import { PriceComponent } from './models/cells/components/price-component';
import { NzCheckboxModule, NzDropDownModule, NzPopoverModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

const entryComponents = [
  DataGrid,
  IconComponent,
  PriceComponent,
];

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
    ResizableModule,
    NzTransferModule,
    NzMenuModule,
    NzButtonModule,
    NzModalModule,
    NzIconModule,
    NzCheckboxModule,
    NzPopoverModule,
    NzDropDownModule,
    FormsModule
  ],
  declarations: [
    ItemViewBuilder,
    ...entryComponents,
  ],
  entryComponents,
  exports: entryComponents,
})
export class DataGridModule {
}
