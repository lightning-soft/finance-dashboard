import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {PositionItem} from './models/position.item';
import {DataCell} from '../data-grid/models/cells';
import {PositionsRepository} from '../communication/trading/repositories/positions.repository';
import {IPosition} from '../communication/trading/models';
import {BoldCell} from '../data-grid/models/cells/bold.cell';

@UntilDestroy()
@Component({
  selector: 'positionList',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnInit, OnDestroy {
  headers = ['account', 'price', 'size', 'unrealized', 'realized', 'total'];

  _isList = true;

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

  private generateGroupItems() {
    this.items = [];
    const positions = this.positions;

    const groupKey = 'account';
    const groupedPositions = groupBy(positions, groupKey);


    for (let key in groupedPositions) {
      const positionItem = new PositionItem();
      const dataCell = new BoldCell();
      dataCell.updateValue(key);
      dataCell.colSpan = this.headers.length;
      positionItem[groupKey] = dataCell;
      this.items.push(positionItem);
      groupedPositions[key].forEach((item) => {
        this.items.push(new PositionItem(item));
      });
    }

  }

  private generateListItems() {
    this.items = [];
    this.positions.forEach((item) => {
      this.items.push(new PositionItem(item));
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
