import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { IIdObject, IPaginationParams, IPaginationResponse } from '../models';
import { IItemsBuilder, ItemsBuilder } from './items.builder';
import { LoadingComponent } from './loading.component';

export type ResponseHandling = 'append' | 'prepend' | null;

@Directive()
export abstract class ItemsComponent<T extends IIdObject, P extends IPaginationParams = any>
    extends LoadingComponent<P, T> implements OnInit, OnDestroy {
    public allItemsLoaded = false;

    builder: IItemsBuilder<T, any> = new ItemsBuilder<T>();

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

    protected _handleUpdateItem(items: T[]) {
        this.builder.handleUpdateItems(items);
    }


    protected _handleCreateItems(items: T[]) {
        this.builder.handleCreateItems(items);

        // const createdItems = Array.isArray(item) ? item.length : 1;
        // this.totalItems = this.totalItems + createdItems;
    }

    protected _handleDeleteItems(items: T[]) {
        this.builder.handleDeleteItems(items);
        // const deletedItems = Array.isArray(items) ? items.length : 1;
        // this.totalItems = this.totalItems - deletedItems;
    }

    protected _handleResponse(response: IPaginationResponse<T>) {
        if (Array.isArray(response?.data)) {
            // if (response) {
            // this.totalItems = response.totalItems;
            // }

            const { take, skip } = (this._params || {}) as IPaginationParams;

            if (skip === 0)
                this.builder.replaceItems(response.data);
            else
                this.builder.addItems(response.data);

            if (take != null && response.data.length < take) {
                this.allItemsLoaded = true;
            }
        } else {
            throw new Error('Invalid response');
        }
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
