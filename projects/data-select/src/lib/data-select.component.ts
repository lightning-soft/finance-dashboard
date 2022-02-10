import { Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
// need to fix circular dependency
import { ItemsComponent } from 'projects/base-components/src/components/items.component';
import { Repository } from 'communication';
import { untilDestroyed } from '@ngneat/until-destroy';

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
  @Input() finder;
  @Input('repository') protected _repository: Repository;
  @Input() autoSelectFirst = true;
  @Input() disabled = false;
  @Input() withActions = false;
  @Input() showTooltip = false;
  @Input() editCallback = (item) => this.handleValueChange(item);
  @Input() dropdownClassName = '';
  @Output() handleChange = new EventEmitter<any>();
  @Output() handleUpdate = new EventEmitter<any>();
  opened = false;

  actions: IDataSelectItemAction[] = [
    {
      icon: 'icon-edit',
      autoClose: true,
      callback: (item: any) => {
        this.editCallback(item);
      },
    },
    {
      icon: 'icon-duplicate',
      autoClose: true,
      callback: (item: any) => {
        const { id, ..._item } = item;
        this._repository.createItem({ ..._item, name: `${ _item.name } (copy)` })
          .pipe(untilDestroyed(this))
          .subscribe((res) => {
            this.handleValueChange(res);
          });
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
      if (!this.finder)
        return;

      const item = this.items.find(a => this.finder(this.value, a));
      if (item)
        this.value = item.id;
    }
  }

  handleValueChange(item: any = this.value) {
    if (typeof item === 'object') {
      this.value = item.id;
    } else {
      this.value = item;

      const items = this.default ? [this.default].concat(this.items) : this.items;

      item = items.find(i => i.id == this.value);
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

  _filterResponse(response) {
    return true;
  }

  protected _handleResponse(response, params) {
    super._handleResponse(response, params);
    if (!this.autoSelectFirst)
      return;

    if (this.value != null) {
      this.handleValueChange();
    } else {
      this._setValueIfNeeded();
    }
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

    if (item.id === this.value) {
      if (index > 0) {
        this.handleValueChange(this.items[index - 1]);
      } else if (this.default) {
        this.handleValueChange(this.default);
      }
    }

    super._handleDeleteItems(items);
  }

  private _setValueIfNeeded() {
    if (this.default) {
      this.handleValueChange(this.default);
    } else if (this.items.length) {
      this.handleValueChange(this.items[0]);
    }
  }

}
