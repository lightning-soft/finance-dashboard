import { Directive, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IBaseItem, IPaginationParams } from 'communication';
import { ItemsComponent } from './items.component';

@UntilDestroy()
@Directive()
export class RealtimeItemsComponent<T extends IBaseItem, P extends IPaginationParams = any>
  extends ItemsComponent<T, P> implements OnInit, OnDestroy {

  protected _dataFeed: any;

  private _unsubscribeFunctions = [];

  addUnsubscribeFn(value) {
    this._unsubscribeFunctions.push(value);
  }

  ngOnInit() {
    super.ngOnInit();

    this._subscribeToDataFeed();
  }

  protected _subscribeToDataFeed() {
    if (!this._dataFeed) {
      return;
    }

    this.addUnsubscribeFn(this._dataFeed.on((item: T) => {
      console.log(this._dataFeed.type, item);

      const oldItem = this.items.find(i => i.id === item.id);

      if (oldItem) {
        const _oldItem = this.builder.unwrap(oldItem);

        this._handleUpdateItems([this._dataFeed.merge(_oldItem, item)]);
      } else {
        this._handleCreateItems([item]);
      }
    }));
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    for (const fn of this._unsubscribeFunctions) {
      fn();
    }
  }
}
