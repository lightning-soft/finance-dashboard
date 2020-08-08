import {Component, Input, OnInit} from '@angular/core';

export interface IDataItem {
  value: string;
  status?: DataStatus;
}
export enum DataStatus {
  UP, DOWN, NONE
}
@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {
  @Input() headers = [];
  @Input() data = [] as IDataItem[];

  constructor() {
  }

  ngOnInit(): void {
  }

  isRising(record: IDataItem) {
    return record.status != null && record.status === DataStatus.UP;
  }

  isFalling(record: IDataItem) {
    return record.status != null && record.status === DataStatus.DOWN;
  }
}
