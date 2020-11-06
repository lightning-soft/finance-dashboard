import { Directive, OnDestroy, OnInit } from '@angular/core';
import { IBaseItem, IPaginationParams, IPaginationResponse, PaginationResponsePayload, RealtimeAction } from 'communication';
import { Observable, Subscription } from 'rxjs';
import { finalize, first } from 'rxjs/operators';
import { IItemsBuilder, ItemsBuilder } from './items.builder';
import { LoadingComponent } from './loading.component';

@Directive()
export abstract class ItemsComponent<T extends IBaseItem, P extends IPaginationParams = any>
  extends LoadingComponent<P, T> implements OnInit, OnDestroy {
  public allItemsLoaded = false;
  public responsePayload: PaginationResponsePayload = {
    count: 0,
    pageCount: 0,
    page: 0,
    total: 1,
  };

  builder: IItemsBuilder<T, any> = new ItemsBuilder<T>();

  realtimeActionSubscription: Subscription;

  get items() {
    return this.builder.items;
  }

  // protected queryParams: P = {} as P;
  protected _params: P;

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

  ngOnInit() {
    super.ngOnInit();

    this.realtimeActionSubscription = this.repository.subscribe(({ action, items }) => {
      switch (action) {
        case RealtimeAction.Create:
          this._handleCreateItems(items);
          break;
        case RealtimeAction.Update:
          this._handleUpdateItems(items);
          break;
        case RealtimeAction.Delete:
          this._handleDeleteItems(items);
          break;
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.realtimeActionSubscription.unsubscribe();
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
        (response) => this._handleResponse(response, loadingParams),
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

  protected _handleResponse(response: IPaginationResponse<T>, params: any) {
    if (Array.isArray(response?.data)) {
      // if (response) {
      // this.totalItems = response.totalItems;
      // }

      let { take, skip, page } = (params || {}) as IPaginationParams;
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
}
