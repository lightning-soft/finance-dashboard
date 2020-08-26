import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { IPosition, PositionsRepository } from 'communication';
import { ItemsComponent } from 'core';
import { PositionItem } from './models/position.item';
import { CellClickDataGridHandler, Events } from '../data-grid';

@Component({
  selector: 'position-list',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
})
export class PositionsComponent extends ItemsComponent<IPosition> implements OnInit, OnDestroy {
  headers = ['account', 'price', 'size', 'unrealized', 'realized', 'total', 'close'];

  _isList = false;

  set isList(isList) {
    if (isList === this._isList) {
      return;
    }

    this._isList = isList;
    this._handleIsListChange();
  }

  get isList() {
    return this._isList;
  }

  positions: PositionItem[] = [];
  positionsMap = new Map<string, PositionItem>();

  handlers = [
    new CellClickDataGridHandler<PositionItem>({
      column: 'close',
      handler: (item) => this.deleteItem(item.position),
    }),
  ];

  constructor(
    protected _repository: PositionsRepository,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected injector: Injector
  ) {
    super();
    this.autoLoadData = { onInit: true };
  }

  private generateGroupItems() {
    // this.items = [];
    // const positions = this.positions;

    // const groupKey = 'account';
    // const groupedPositions = groupBy(positions, groupKey);

    // for (let key in groupedPositions) {
    //   const positionItem = new PositionItem();

    //   positionItem[groupKey] = this.createGroupHeader(key);
    //   positionItem.click.click = this.deleteItem.bind(this);
    //   positionItem.id = groupedPositions[key].map(item => item.id);
    //   this.items.push(positionItem);

    //   groupedPositions[key].forEach((item) => {
    //     this.items.push(new PositionItem(item, this.deleteItem.bind(this)));
    //   });
    // }
  }
  _replaceItems(items: IPosition[]) {
    this.positions = items.map(i => new PositionItem(i));
  }

  _addItems(items: IPosition[]) {
    this.positions = [...this.positions, ...items.map(i => new PositionItem(i))];
  }

  createGroupHeader(key) {
    // const dataCell = new DataCell();
    // dataCell.updateValue(key);
    // dataCell.bold = true;
    // dataCell.colSpan = this.headers.length - 1;
    // return dataCell;
  }

  _generateList() {

  }

  _generateGroupedList() {

  }

  _handleIsListChange() {
    if (this.isList) {
      this._generateList();
    } else {
      this._generateGroupedList();
    }
  }
}
