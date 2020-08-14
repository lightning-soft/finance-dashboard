import {Component, OnDestroy, OnInit} from '@angular/core';
import {Datafeed, InstrumentsRepository} from 'communication';
import {UntilDestroy} from '@ngneat/until-destroy';
import {PositionItem, Position} from './models/position.item';
import {DataCell} from '../data-grid/models/cells';

@UntilDestroy()
@Component({
  selector: 'positionList',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss']
})
export class PositionComponent implements OnInit, OnDestroy {
  headers = ['account', 'price', 'size', 'unrealized', 'realized', 'total'];

  items: PositionItem[] = [];

  private subscriptions = [] as Function[];


  constructor(
    private _instrumentsRepository: InstrumentsRepository,
    private _datafeed: Datafeed
  ) {
  }

  ngOnInit(): void {
    const positions = [
      {account: 'BTCUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
      {account: 'BTCUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
      {account: 'BTCUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
      {account: 'BTCUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},

      {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
      {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
      {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
      {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},

    ] as Position[];

    const groupKey = 'account';

    const groupedPositions = groupBy(positions, groupKey);

    console.log(groupedPositions);

    for (let key in groupedPositions) {
      const positionItem = new PositionItem();
      const dataCell = new DataCell();
      dataCell.updateValue(key);
      dataCell.class = 'text-bold';
      positionItem[groupKey] = dataCell;
      this.items.push(positionItem);
      groupedPositions[key].forEach((item) => {
        this.items.push(new PositionItem(item));
      });
    }

    console.log(this.items);
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(item => item());
  }

}

// https://stackoverflow.com/a/34890276
const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
