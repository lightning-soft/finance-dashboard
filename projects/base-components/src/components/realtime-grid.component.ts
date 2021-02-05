import { Directive, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IBaseItem, IPaginationParams } from 'communication';
import { DataGrid } from 'data-grid';
import { ILayoutNode, LayoutNodeEvent } from 'layout';
import { SynchronizeFrames } from 'performance';
import { ITrade, Level1DataFeed, OnTradeFn } from 'trading';
import { ItemsComponent } from './items.component';

export function convertToColumn(nameOrArr: any) {
  nameOrArr = Array.isArray(nameOrArr) ? nameOrArr : ([nameOrArr, nameOrArr]);
  const [name, title, type] = nameOrArr;

  return {
    name,
    type,
    style: {
      textOverflow: true,
      textAlign: 'left',
    },
    title: title.toUpperCase(),
    visible: true
  };
}

export interface RealtimeGridComponent<T extends IBaseItem, P extends IPaginationParams = any> extends ILayoutNode {
}


@UntilDestroy()
@Directive()
export class RealtimeGridComponent<T extends IBaseItem, P extends IPaginationParams = any>
  extends ItemsComponent<T, P> implements OnInit, OnDestroy {

  @ViewChild(DataGrid, { static: true })
  dataGrid: DataGrid;

  protected _dataFeed: any;
  protected _levelOneDataFeed: Level1DataFeed;
  protected _levelOneDataFeedHandler: OnTradeFn<ITrade>;

  ngOnInit() {
    super.ngOnInit();

    this._subscribeToDataFeed();

    this._levelOneDataFeed = this._injector.get(Level1DataFeed);

    this._onLevelOneDataFeed();
  }

  ngAfterViewInit() {
    this._handleResize();
  }

  @SynchronizeFrames()
  private _handleResize() {
    this.dataGrid.resize();
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
        this._handleResize();
        break;
      case LayoutNodeEvent.Event:
        this._handleKey(data);
    }

    return true;
  }

  protected _handleKey(event) {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    // this.keysStack.handle(event);
    // const keyBinding = Object.entries(this._settings.hotkeys)
    //   .map(([name, item]) => [name, KeyBinding.fromDTO(item as any)])
    //   .find(([name, binding]) => {
    //     return (binding as KeyBinding).equals(this.keysStack);
    //   });
    // if (keyBinding) {
    //   this.domKeyHandlers[keyBinding[0] as string]();
    // }

  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this._unsubscribeFromLevelOneDataFeed(this.items);
  }

  protected _subscribeToDataFeed() {
    if (!this._dataFeed) {
      return;
    }

    this._dataFeed.on((item: T) => {
      console.log(this._dataFeed.type, item);

      const oldItem = this.items.find(i => i.id === item.id);

      if (oldItem) {
        const _oldItem = this.builder.unwrap(oldItem);

        this._handleUpdateItems([this._dataFeed.merge(_oldItem, item)]);
      } else {
        this._handleCreateItems([item]);
      }
    });
  }

  protected _onLevelOneDataFeed() {
    if (!this._levelOneDataFeedHandler) {
      return;
    }

    this._levelOneDataFeed.on(this._levelOneDataFeedHandler.bind(this));
  }

  protected _subscribeToLevelOneDataFeed(items: T[]) {
    if (!this._levelOneDataFeedHandler) {
      return;
    }

    items.forEach(item => {
      this._levelOneDataFeed.subscribe((item as any).instrument);
    });
  }

  protected _unsubscribeFromLevelOneDataFeed(items: T[]) {
    if (!this._levelOneDataFeedHandler) {
      return;
    }

    items.forEach(item => {
      this._levelOneDataFeed.unsubscribe((item as any).instrument);
    });
  }

  protected _handleCreateItems(items: T[]) {
    super._handleCreateItems(items);

    this._subscribeToLevelOneDataFeed(items);
  }

  protected _handleDeleteItems(items: T[]) {
    super._handleDeleteItems(items);

    this._unsubscribeFromLevelOneDataFeed(items);
  }
}
