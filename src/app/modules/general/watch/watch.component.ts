import {Component, OnInit} from '@angular/core';
import {DataStatus, IDataItem} from '../../../data-grid/data-grid.component';

const createItem = (value, status?: DataStatus): IDataItem => {
  return {value, status} as IDataItem;
};

@Component({
  selector: 'app-about',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss']
})
export class WatchComponent implements OnInit {
  headers = ['price', 'amount', 'time'];
  data = [
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.DOWN), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.DOWN), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.DOWN), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.DOWN), createItem('0.0506'), createItem('06:31:11')],
    [createItem('3816.69 ', DataStatus.UP), createItem('0.0506'), createItem('06:31:11')],
  ];

  constructor() {
  }

  ngOnInit(): void {
  }

}
