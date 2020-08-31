import { Directive, OnInit } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { IIdObject } from '../models';
import { LoadingComponent } from './loading.component';

@Directive()
export abstract class ItemComponent<T extends IIdObject> extends LoadingComponent<null> implements OnInit {
    needCreate = false;
    item: T;

    protected _getItem(id?: any): Observable<T> {
        if (!id) {
            const { params = {} } = this.route.snapshot || {};
            id = params.id;
        }

        if (!id)
            return EMPTY;

        return this.repository.getItemById(id);
    }

    loadData(params?: any) {
        const hide = this.showLoading(true);

        this._getItem(params)
            .pipe(first(), finalize(() => {
                hide();
            }))
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

    protected _handleCreateItems(items: T[]) {
        let item;
        if (isArray(items))
          item = items[0];
         else
          item = items as any;

        if (item)
          this.item = {...item};
  }

    protected _handleDeleteItems(items: IIdObject[]) {
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

const isArray = (items) => {
 return  Array.isArray(items) && items.length;
};
