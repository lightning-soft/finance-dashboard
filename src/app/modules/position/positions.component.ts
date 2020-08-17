import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {PositionItem} from './models/position.item';
import {DataCell} from '../data-grid/models/cells';
import {PositionsRepository} from '../communication/trading/repositories/positions.repository';
import {IPosition} from '../communication/trading/models';
import { IViewBuilderStore, ViewBuilderStore } from '../data-grid';
import { IconComponent, iconComponentSelector } from '../data-grid/models/cells/components/icon-conponent';

@UntilDestroy()
@Component({
  selector: 'positionList',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
  providers: [{
    provide: IViewBuilderStore,
    useValue: new ViewBuilderStore({
      [iconComponentSelector]: IconComponent
    })
  }]
})
export class PositionsComponent implements OnInit, OnDestroy {
  headers = ['account', 'price', 'size', 'unrealized', 'realized', 'total', 'click'];

  _isList = false;

  set isList(isList) {
    if (isList === this._isList) {
      return;
    }
    this._isList = isList;
    this.updateItems();
    this.changeDetectorRef.detectChanges();
  }

  get isList() {
    return this._isList;
  }

  items: PositionItem[] = [];

  positions: IPosition[] = [];

  constructor(
    private positionsRepository: PositionsRepository,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {

    this.positionsRepository.getItems()
      .pipe(
        untilDestroyed(this)
      ).subscribe(
      (positions) => {
        this.positions = positions;
        this.updateItems();
      }
    );
  }

  deleteItem(item) {
    const oldLength = this.positions.length;
    this.positions = this.positions.filter((pos) => {
      return ![...item.id].includes(pos.id);
    });
    if (oldLength === this.positions.length) {
      this.updateItems();
    }
  }

  private generateGroupItems() {
    this.items = [];
    const positions = this.positions;

    const groupKey = 'account';
    const groupedPositions = groupBy(positions, groupKey);


    for (let key in groupedPositions) {
      const positionItem = new PositionItem();

      positionItem[groupKey] = this.createGroupHeader(key);
      positionItem.click.click = this.deleteItem.bind(this);
      positionItem.id = groupedPositions[key].map(item => item.id);
      this.items.push(positionItem);

      groupedPositions[key].forEach((item) => {
        this.items.push(new PositionItem(item, this.deleteItem.bind(this)));
      });
    }

  }

  createGroupHeader(key) {
    const dataCell = new DataCell();
    dataCell.updateValue(key);
    dataCell.bold = true;
    dataCell.colSpan = this.headers.length - 1;
    return dataCell;
  }

  private generateListItems() {
    this.items = [];
    this.positions.forEach((item) => {
      this.items.push(new PositionItem(item, this.deleteItem.bind(this)));
    });

  }

  updateItems() {
    this._isList ? this.generateListItems()
      : this.generateGroupItems();
  }

  ngOnDestroy(): void {
  }

}

// https://stackoverflow.com/a/34890276
const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
