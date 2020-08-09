import {
  Component,
  Input
} from '@angular/core';
import { ICell } from '../../models';

export interface DataGridItem {
  [key: string]: ICell;
}

@Component({
  selector: 'data-grid',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.scss'],
})
export class DataGrid<T extends DataGridItem = any> {
  rowHeight = 35;

  @Input()
  columns = [];

  @Input()
  items: T[];

  trackByFn(index) {
    return index;
  }
}
