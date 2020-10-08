import { Directive, OnInit } from '@angular/core';
import { IBaseItem } from 'communication';
import { EMPTY, Observable } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { LoadingComponent } from './loading.component';

@Directive()
export abstract class ItemComponent<T extends IBaseItem> extends LoadingComponent<null> implements OnInit {
  needCreate = false;
  item: T;

  protected _getItem(id?: any, query?: any): Observable<T> {
    if (id == null) {
      const { params = {} } = this.route.snapshot || {};
      id = params.id;
    }

    if (!id)
      return EMPTY;

    return this.repository.getItemById(id, query);
  }

  protected _getIdFromParams(params) {
    if (params?.id)
      return params.id;
    if (typeof params === 'string' || typeof params === 'number') {
      return params;
    }
    return null;
  }

  loadData(params?: any) {
    const id = this._getIdFromParams(params);
    this.needCreate = id == null;
    if (this.needCreate)
      return;

    const hide = this.showLoading(true);
    this._getItem(id, params?.query)
      .pipe(first(), finalize(() => hide()))
      .subscribe(
        (item) => {
          this.handleItem(item);
        },
        (error) => {
          this._handleLoadingError(error);
        }
      );
  }

  protected handleItem(item: T) {
    if (!item || item.id)
      this.needCreate = true;

    this.item = item;
  }

  protected _handleErrorDelete(error) {
    console.warn('Implement _handleErrorDelete', error);
  }

  protected _handleUpdateItems(items: T[]) {
    const item = items.find(i => i.id === this.item.id);
    if (!items || !this.item || item)
      return false;

    this.item = { ...this.item, ...item };
    return true;
  }

  protected _handleDeleteItems(items: IBaseItem[]) {
    if (!items || !items.length)
      return;

    const ids = items.map(i => i.id);
    if (!this.item || !ids.includes(this.item.id))
      return;

    this._navigateOnSuccessAction(); // todo: temporary solution (need test)
  }

  protected _handleLoadingError(error: Error) {
    return super._handleLoadingError(error);
  }
}
