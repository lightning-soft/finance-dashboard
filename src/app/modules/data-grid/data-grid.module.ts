import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ItemViewBuilder } from './components/item-view-builder';
import { DataGrid } from './components/data-grid/data-grid.component';
import { ModalComponent } from './components/modal/modal.component';
import { IconComponent } from './models/cells/components/icon-conponent';

const entryComponents = [
  DataGrid,
  IconComponent,
  ModalComponent,
];

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
    NzTransferModule,
    NzMenuModule,
    NzButtonModule,
    NzModalModule,
    NzIconModule
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
