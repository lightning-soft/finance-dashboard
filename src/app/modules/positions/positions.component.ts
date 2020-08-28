import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { IPosition, PositionsRepository } from 'communication';
import { ItemsComponent, ViewItemsBuilder } from 'core';
import {CellClickDataGridHandler, DataCell} from '../data-grid';
import { PositionItem } from './models/position.item';
import { NotifierService } from 'notifier';

class PositionViewBuilder extends ViewItemsBuilder<IPosition, PositionItem> {
  isGrouped = false;
  colSpan = 0;

  constructor() {
    super(true);
  }

  _cast(item: IPosition): PositionItem {
    return new PositionItem(item);
  }

  toggleGrouped(value) {
    if (this.isGrouped === value)
      return;

    this.isGrouped = value;
    if (this.isGrouped)
      this._groupItems();
    else
      this._ungroupItems();

  }

  _groupItems() {
    const _map = new Map<string, PositionItem[]>();

    for (const [key, item] of this._itemsMap) {
      const instruemntId = item.position.account;

      if (!_map.has(instruemntId))
        _map.set(instruemntId, [item]);
      else _map.get(instruemntId).push(item);
    }

    this.items = [];
    for (const [key, items] of _map) {
      const groupedItem = new PositionItem();
      groupedItem.account  = new DataCell();
      groupedItem.account.updateValue(key);
      groupedItem.account.bold = true;
      groupedItem.account.colSpan = this.colSpan;
      this.items.push(groupedItem, ...items);
    }
  }

  _ungroupItems() {
    this.items = Array.from(this._itemsMap.values());
  }
}

@Component({
  selector: 'position-list',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
})
export class PositionsComponent extends ItemsComponent<IPosition> implements OnInit, OnDestroy {
  headers = ['account', 'price', 'size', 'unrealized', 'realized', 'total', 'close'];

  builder = new PositionViewBuilder();

  set isList(isList) {
    this.builder.toggleGrouped(!isList);
  }

  get isList() {
    return !this.builder.isGrouped;
  }

  handlers = [
    new CellClickDataGridHandler<PositionItem>({
      column: 'close',
      handler: (item) => this.deleteItem(item.position),
    }),
  ];


  constructor(
    protected _repository: PositionsRepository,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected injector: Injector,
    public notifier: NotifierService
  ) {
    super();
    this.builder.colSpan = this.headers.length - 1;
    this.autoLoadData = { onInit: true };
  }

  deleteItem(item: IPosition, event?) {
    if (item && item.id != null)
      super.deleteItem(item, event);
  }

}
