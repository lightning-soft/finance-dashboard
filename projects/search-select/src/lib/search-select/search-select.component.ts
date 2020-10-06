import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ItemsComponent } from 'base-components';
import { Repository } from 'communication';
import { NzSelectModeType } from 'ng-zorro-antd';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NotifierService } from 'notifier';

export enum SelectDisplayType {
  Title, TitleWithId,
}

@UntilDestroy()
@Component({
  selector: 'search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchSelectComponent),
      multi: true,
    }
  ]
})
export class SearchSelectComponent extends ItemsComponent<any> implements ControlValueAccessor {
  private _selectedItem: any;
  onChange;
  onTouched;

  get selectedItem(): any {
    return this._selectedItem;
  }

  @Input()
  set selectedItem(value: any) {
    if (this._selectedItem?.id != null && value?.id != null
      && this._selectedItem?.id === value?.id)
      return;
    this.itemChange.emit(value);
    if (this.onChange)
      this.onChange(value);
    if (this.onTouched)
      this.onTouched();
    this._selectedItem = value;
  }

  @Input() placeholder: string;
  @Input() searchQueryParam = 'title';
  @Input() repository: Repository<any>;

  @Input() autoLoad: boolean;

  @Input() set displayType(value: SelectDisplayType) {
    this.displayLabel = displayHandlers[value];
  }

  @Output()
  itemChange = new EventEmitter();

  @Input()
  customOptionTemplate: any;

  // $implicit is NzSelectItemInterface not value itself
  @Input()
  customValueTemplate;

  @Input()
  type: NzSelectModeType = 'default';
  isDisabled = false;

  @Input()
  showSearch = true;

  @Input()
  displayLabel(o: any) {
    return '#' + o.id + ' ' + o.title;
  }

  constructor(protected _notifier: NotifierService) {
    super();
    this.autoLoadData = !this.autoLoad ? { onInit: true } : false;
  }


  onSearch(value: string) {
    this.loadData({ s: JSON.stringify({ [this.searchQueryParam]: { $contL: value } }), take: 100000, skip: 0 });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.selectedItem = obj;
  }

  compareSelect(a: any, b: any) {
    return a?.id === b?.id;
  }
}

const displayHandlers = {
  [SelectDisplayType.Title]: (o) => {
    return o.title;
  },
  [SelectDisplayType.TitleWithId]: (o) => {
    return o.title;
  }
};
