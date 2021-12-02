import { Directive, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IBaseItem, IPaginationParams } from 'communication';
import { Column, DataGrid } from 'data-grid';
import { ILayoutNode, LayoutNodeEvent } from 'layout';
import { ItemsComponent } from './items.component';
import { StringHelper } from '../helpers';

type HeaderItemOptions<ColumnName = string> = (Partial<Column> & { name: ColumnName });
export type HeaderItem<ColumnName = string> = ColumnName | HeaderItemOptions<ColumnName>;

const DefaultStyles: any = {
  textOverflow: false,
  textAlign: 'left',
  titleUpperCase: true,
};

export function convertToColumn(item: HeaderItem, defaultStyles: any = DefaultStyles): Column {
  const options: HeaderItemOptions = typeof item === 'string' ? { name: item } : item;
  const title = options.title ?? options.name;
  const style = {
    ...defaultStyles,
    ...options.style,
  };

  return {
    ...options,
    style,
    visible: options.visible ?? true,
    hidden: options.hidden ?? false, // not shown in tableView
    canHide: options.canHide ?? true,
    title: defaultStyles.titleUpperCase ? title.toUpperCase() : title,
    subtitle: options.subtitle,
    tableViewName: options.tableViewName ?? StringHelper.capitalize(title),
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

  private _unsubscribeFunctions = [];

  addUnsubscribeFn(value) {
    this._unsubscribeFunctions.push(value);
  }

  ngOnInit() {
    super.ngOnInit();

    this._subscribeToDataFeed();
  }

  ngAfterViewInit() {
    this._handleResize();
  }

  // @SynchronizeFrames()
  protected _handleResize() {
    this.dataGrid?.resize();
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
      case LayoutNodeEvent.MakeVisible:
        this._handleResize();
        break;
      case LayoutNodeEvent.Event:
        return this._handleKey(data);
    }

    return true;
  }

  protected _handleKey(event) {
    if (!(event instanceof KeyboardEvent)) {
      return true;
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

  protected _subscribeToDataFeed() {
    if (!this._dataFeed) {
      return;
    }

    this.addUnsubscribeFn(this._dataFeed.on((_item: T) => {
      const item = this._transformDataFeedItem(_item);

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
    for (const fn of this._unsubscribeFunctions) {
      fn();
    }
    super.ngOnDestroy();
  }


  protected _transformDataFeedItem(item) {
    return item;
  }
}
