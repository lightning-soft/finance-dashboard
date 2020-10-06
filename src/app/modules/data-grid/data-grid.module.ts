import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DataGrid } from './components/data-grid/data-grid.component';
import { ItemViewBuilder } from './components/item-view-builder';
import { IconComponent } from './models/cells/components/icon-conponent';
import { ResizebleDirective } from './directives/resizeble.directive';

const entryComponents = [
  DataGrid,
  IconComponent,
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
    ResizebleDirective,
    ...entryComponents,
  ],
  entryComponents,
  exports: entryComponents,
})
export class DataGridModule {
}
