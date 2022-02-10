import { Directive, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IBaseItem, IPaginationParams, IPaginationResponse, PaginationResponsePayload } from 'communication';
import { DataGrid } from 'data-grid';
import { Observable, Subscription } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { IItemsBuilder, ItemsBuilder } from './items.builder';
import { LoadingComponent } from './loading.component';

@UntilDestroy()
@Directive()
export abstract class ItemsComponent<T extends IBaseItem, P extends IPaginationParams = any>
  extends LoadingComponent<P, T> implements OnInit {
  public allItemsLoaded = false;
  public responsePayload: PaginationResponsePayload = {
    count: 0,
    pageCount: 0,
    page: 0,
    total: 1,
  };

  @ViewChild('grid', { static: true })
  protected _dataGrid: DataGrid;

  protected _updatedAt: number;
  protected _upadateInterval: number = 1000 / 60;

  builder: IItemsBuilder<T, any> = new ItemsBuilder<T>();

  protected _clearOnDisconnect = true;

  protected _dataSubscription: Subscription;

  get items() {
    return this.builder.items;
  }

  // protected queryParams: P = {} as P;
  protected _params: P = {} as P;

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
    this._params = { ...this._params, skip: value };
  }

  private _total: number;

  set total(value: number) {
    // const totalItems = +value;

    // if (!isNaN(totalItems) && this._total !== totalItems) {
    this._total = value;

    //   this.setQueryParams({ totalItems });
    // }
  }

  get total(): number {
    return this._total;
  }

  loadData(params?: P) {
    this._params = params || this._params;

    const hide = this.showLoading(true);

    this._dataSubscription?.unsubscribe();

    this._dataSubscription = this._getItems(this.params)
      .pipe(
        first(),
        finalize(() => hide())
      )
      .subscribe(
        (response) => {
          if (this._filterResponse(response)) {
            this._handleResponse(response, this.params);
          }
        },
        (error) => this._handleLoadingError(error),
      );
  }
  protected _filterResponse(response: IPaginationResponse){
    return !response.requestParams || JSON.stringify(response.requestParams) === JSON.stringify(this.params);
  }

  protected _getItems(params?): Observable<IPaginationResponse<T>> {
    return this.repository.getItems(params);
  }

  refresh() {
    this.skip = 0;

    this.loadData();
  }

  protected _onQueryParamsChanged(params?: any) {
    // this.total = +((params || {})).totalItems;

    if (!this.isPaginationQueryParamsChanged(this._queryParams, params)) {
      this.setQueryParams({ skip: 0 } as IPaginationParams);
    }

    super._onQueryParamsChanged(params);
  }

  protected _handleUpdateItems(items: T[]) {
    this.builder.handleUpdateItems(items);
    this.detectChanges();
  }


  protected _handleCreateItems(items: T[]) {
    this.builder.handleCreateItems(items);
    this.detectChanges();

    // const createdItems = Array.isArray(item) ? item.length : 1;
    // this.totalItems = this.totalItems + createdItems;
  }

  protected _handleDeleteItems(items: T[]) {
    this.builder.handleDeleteItems(items);
    this.detectChanges();
    // const deletedItems = Array.isArray(items) ? items.length : 1;
    // this.totalItems = this.totalItems - deletedItems;
  }

  protected _handleResponse(response: IPaginationResponse<T>, params: any = {}) {
    if (Array.isArray(response?.data)) {
      // if (response) {
      // this.totalItems = response.totalItems;
      // }

      let { take, skip, page } = params as IPaginationParams;
      if (skip == null)
        skip = (page - 1) * take;

      const { data, ...payload } = response;
      if (skip === 0)
        this.builder.replaceItems(data);
      else
        this.builder.addItems(data);

      if (take != null && data.length < take) {
        this.allItemsLoaded = true;
      }

      this.responsePayload = payload;
    } else if (Array.isArray(response)) {
      this.builder.replaceItems(response);
      this.allItemsLoaded = true;
      this.responsePayload = {
        count: this.builder.items.length,
        total: this.builder.items.length,
        page: 1,
        pageCount: 1,
      };
    } else {
      throw new Error('Invalid response');
    }
  }

  protected _handleLoadingError(error: any) {
    console.error(error);

    this.showError(error, 'action.load-items-error');
  }

  protected isQueryParamsChanged(oldParams, params): boolean {
    // const { totalItems: prevTotalItems = null, ...prev } = oldParams || {};
    // const { totalItems, ...curr } = params;

    return super.isQueryParamsChanged(oldParams, params);
  }

  protected isPaginationQueryParamsChanged(oldParams = {} as IPaginationParams, params = {} as IPaginationParams) {
    return true;
  }

  protected setQueryParams(params: any, merge = true): void {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: merge ? 'merge' : '',
      replaceUrl: true,
    });
  }

  detectChanges(force = false) {
    if (!(this as any)._shouldDraw)
      return;

    if (!force && (this._updatedAt + this._upadateInterval) > Date.now())
      return;

    if (this._dataGrid)
      this._dataGrid.detectChanges(force);

    this._updatedAt = Date.now();
  }
}
