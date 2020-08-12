import {
  Component,
  Input, ViewChild
} from '@angular/core';
import { ICell } from '../../models';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';

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

  @ViewChild(CdkVirtualScrollViewport)
  public viewPort: CdkVirtualScrollViewport;

  @Input()
  columns = [];

  @Input()
  items: T[];

  trackByFn(index) {
    return index;
  }

  public get inverseTranslation(): string {
    if (!this.viewPort || !this.viewPort['_renderedContentOffset']) {
      return '-0px';
    }

    const offset = this.viewPort['_renderedContentOffset'];
    return `-${offset}px`;
  }
}
