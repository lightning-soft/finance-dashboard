import { Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ItemsComponent } from 'base-components';
import { Repository } from 'communication';

interface IDataSelectItemAction {
  icon: string;
  autoClose?: boolean;
  callback: (item: any) => any;
}

@Component({
  selector: 'data-select',
  templateUrl: './data-select.component.html',
  styleUrls: ['./data-select.component.scss'],
})
export class DataSelectComponent extends ItemsComponent<any> implements OnChanges {

  @Input() label: string;
  @Input() default?: any;
  @Input() value?: any;
  @Input('repository') protected _repository: Repository;
  @Input() withActions = false;
  @Output() handleChange = new EventEmitter<any>();
  @Output() handleUpdate = new EventEmitter<any>();

  opened = false;

  actions: IDataSelectItemAction[] = [
    {
      icon: 'icon-edit',
      autoClose: true,
      callback: (item: any) => {
        this.handleValueChange(item);
      },
    },
    {
      icon: 'icon-duplicate',
      autoClose: true,
      callback: (item: any) => {
        const _item = {
          ...item,
          id: this.default?.id
        };

        this.handleValueChange(_item);
      },
    },
    {
      icon: 'icon-delete',
      callback: (item: any) => {
        this.deleteItem(item);
      },
    },
  ];

  constructor(
    protected _injector: Injector,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value) {
      if (typeof this.value === 'object' && this.value !== null) {
        this.value = this.value.id;
      }

      if (this.value == null) {
        this._setValueIfNeeded();
      }
    }
  }

  handleValueChange(item: any = this.value) {
    if (typeof item === 'object') {
      this.value = item.id;
    } else {
      const items = this.default ? [this.default].concat(this.items) : this.items;

      item = items.find(i => i.id === this.value);
    }

    this.handleChange.emit(this.cloneItem(item));
  }

  executeItemAction(item: any, action: IDataSelectItemAction) {
    action.callback(this.cloneItem(item));

    if (action.autoClose) {
      this.opened = false;
    }
  }

  cloneItem(item: any): any {
    return jQuery.extend(true, {}, item);
  }

  protected _handleResponse(response, params) {
    super._handleResponse(response, params);

    this._setValueIfNeeded();
  }

  protected _handleUpdateItems(items: any[]) {
    super._handleUpdateItems(items);

    const item = items[0];

    if (item.id === this.value) {
      this.handleUpdate.emit(item);
    }
  }

  protected _handleDeleteItems(items: any[]) {
    const item = items[0];
    const index = this.items.findIndex(i => i.id === item.id);

    if (this.value === item.id) {
      if (index > 0) {
        this.handleValueChange(this.items[index - 1]);
      } else if (this.default) {
        this.handleValueChange(this.default);
      }
    }

    super._handleDeleteItems(items);
  }

  private _setValueIfNeeded() {
    if (this.value != null) {
      return;
    }

    if (this.default) {
      this.handleValueChange(this.default);
    } else if (this.items.length) {
      this.handleValueChange(this.items[0]);
    }
  }

}
