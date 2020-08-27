import { OnDestroy, OnInit, Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { IIdObject, IPaginationParams, IPaginationResponse } from '../models';
import { LoadingComponent } from './loading.component';

export type ResponseHandling = 'append' | 'prepend' | null;

@Directive()
export abstract class ItemsComponent<T extends IIdObject, P extends IPaginationParams = any>
    extends LoadingComponent<P, T> implements OnInit, OnDestroy {
    public items: T[] = [];
    public allItemsLoaded = false;

    protected queryParams: P = {} as P;
    protected _params: P;

    private _totalItems: number;

    get params(): P {
        return this._params;
    }

    set params(value) {
        this._params = value;
    }

    get skip() {
        const { skip = 0 } = this._params;
        return skip;
    }

    set skip(value: number) {
        (this._params || {} as P).skip = value;
    }

    set totalItems(value: number) {
        const totalItems = +value;

        if (!isNaN(totalItems) && this._totalItems !== totalItems) {
            this._totalItems = totalItems;

            this.setQueryParams({ totalItems });
        }
    }

    get totalItems(): number {
        return this._totalItems;
    }

    getParams(params?: any): P {
        return params;
    }

    loadData(params?: P) {
        this._params = params;

        const hide = this.showLoading(true);
        const loadingParams = this.getParams(params);

        this._getItems(loadingParams)
            .pipe(
                first(),
                finalize(() => hide())
            )
            .subscribe(
                (response) => this._handleResponse(response),
                (error) => this._handleLoadingError(error),
            );
    }

    protected _getItems(params?): Observable<IPaginationResponse<T>> {
        return this.repository.getItems(params);
    }

    refresh() {
        this.loadData(this.params);
    }

    protected _onQueryParamsChanged(params?: any) {
        this.totalItems = +((params || {})).totalItems;

        if (!this.isPaginationQueryParamsChanged(this._queryParams, params)) {
            this.setQueryParams({ skip: 0 } as IPaginationParams);
        }

        super._onQueryParamsChanged(params);
    }

    protected _handleUpdateItem(items: T | T[]) {
        try {
            if (!items)
                return;

            if (Array.isArray(items)) {
                for (const item of items)
                    this._handleUpdateItem(item);

                return;
            }

            const index = this.items.findIndex(t => t.id === items.id);

            if (index !== -1) {
                this.items.splice(index, 1, { ...this.items[index], ...items });
            }
        } catch (e) {
            console.error('error', e);
        }
    }


    protected _handleCreateItem(item: T | T[], responseHandling: ResponseHandling = 'prepend') {
        try {
            if (!item)
                return;
            if (Array.isArray(item)) {
                for (const i of item) {
                    this._handleCreateItem(i);
                }
            } else if (!this.items.find(({ id }) => id === item.id)) {
                this.items = [item, ...this.items];
            }
        } catch (e) {
            console.error('error', e);
        }

        const createdItems = Array.isArray(item) ? item.length : 1;
        this.totalItems = this.totalItems + createdItems;
    }

    protected _handleDeleteItem(items: IIdObject | IIdObject[]) {
        if (!items)
            return;

        if (Array.isArray(items)) {
            for (const item of items)
                this._handleDeleteItem(item);

            return;
        }

        const _id = typeof items === 'object' ? items.id : items;

        try {
            const index = this.items.findIndex(t => t.id === _id);

            if (index !== -1) {
                this.items.splice(index, 1);
            }
        } catch (e) {
            console.error('error', e);
        }

        const deletedItems = Array.isArray(items) ? items.length : 1;
        this.totalItems = this.totalItems - deletedItems;
    }

    protected _handleResponse(response: IPaginationResponse<T>) {
        if (Array.isArray(response?.data)) {
            // if (response) {
            // this.totalItems = response.totalItems;
            // }

            const { take, skip } = (this._params || {}) as IPaginationParams;

            if (skip === 0)
                this._replaceItems(response.data);
            else
                this._addItems(response.data);

            if (take != null && response.data.length < take) {
                this.allItemsLoaded = true;
            }
        } else {
            throw new Error('Invalid response');
        }
    }

    _replaceItems(items: T[]) {
        this.items = items;
    }

    _addItems(items: T[]) {
        this.items = [...items, ...this.items];
    }

    protected _handleLoadingError(error: any) {
        this.showError(error, 'action.load-items-error');
    }

    protected isQueryParamsChanged(oldParams, params): boolean {
        const { totalItems: prevTotalItems = null, ...prev } = oldParams || {};
        const { totalItems, ...curr } = params;

        return super.isQueryParamsChanged(prev, curr);
    }

    protected isPaginationQueryParamsChanged(oldParams = {} as IPaginationParams, params = {} as IPaginationParams) {
        return (oldParams.skip !== params.skip) || (oldParams.take !== params.take);
    }

    protected setQueryParams(params: any): void {
        this.router.navigate([], {
            queryParams: params,
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }
}
