import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ItemsComponent } from 'base-components';
import { Id, Repository } from 'communication';

export interface IDataSelectItemAction {
  icon: string;
  callback: (item: any) => void;
}

@Component({
  selector: 'data-select',
  templateUrl: './data-select.component.html',
  styleUrls: ['./data-select.component.scss'],
})
export class DataSelectComponent extends ItemsComponent<any> implements OnInit, OnChanges {

  @Input() label: string;
  @Input() default?: any;
  @Input() value?: Id;
  @Input() actions: IDataSelectItemAction[] = [];
  @Input('repository') protected _repository: Repository;
  @Output() handleChange = new EventEmitter<any>();

  opened = false;

  constructor(
    protected _injector: Injector,
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.default) {
      this.value = this.default.id;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value) {
      this._setValueIfNeeded();
    }
  }

  handleValueChange() {
    const items = this.default ? [this.default].concat(this.items) : this.items;

    const item = items.find(i => i.id === this.value);

    this.handleChange.emit(this.cloneItem(item));
  }

  cloneItem(item: any): any {
    return jQuery.extend(true, {}, item);
  }

  protected _handleResponse(response, params) {
    super._handleResponse(response, params);

    this._setValueIfNeeded();
  }

  private _setValueIfNeeded() {
    if (!this.default && this.value == null && this.items.length) {
      this.value = this.items[0].id;

      this.handleValueChange();
    }
  }

}
