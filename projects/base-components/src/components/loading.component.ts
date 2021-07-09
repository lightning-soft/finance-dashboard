import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { IBaseItem, Repository, RepositoryAction } from 'communication';
import { NotifierService } from 'notifier';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { isEqual } from 'underscore';

type HideLoader = () => void;

export interface ILoadingHandler {
  showLoading: (init?: boolean) => () => void;
  loading: boolean;
  initializing: boolean;
}

export interface IAutoLoadDataConfig {
  onInit?: boolean;
  onParamsChange?: boolean;
  onQueryParamsChange?: boolean;
  onConnectionChange?: boolean;
}

export interface ILoadingComponentConfig {
  autoLoadData?: false | IAutoLoadDataConfig;
  subscribeToRepository?: boolean;
  subscribeToConnections?: boolean;
}

export function getDefaultLoadingItemConfig(): ILoadingComponentConfig {
  return {
    autoLoadData: {
      onInit: true,
      onParamsChange: true,
      onQueryParamsChange: true,
      onConnectionChange: true,
    },
    subscribeToRepository: true,
    subscribeToConnections: true,
  };
}

@UntilDestroy()
export abstract class LoadingComponent<T, I extends IBaseItem = any> implements OnInit, OnDestroy, ILoadingHandler {
  private _loadingProcesses = 0;
  protected _loading;
  protected _initializing = false;
  loadingError: number = null;
  public MIN_LOADING_TIME = 300;

  config: ILoadingComponentConfig = getDefaultLoadingItemConfig();

  timeBeforeLoadingStart = 0;
  loadingHandler: ILoadingHandler = this;

  protected _route: ActivatedRoute;
  protected _queryParams;
  protected _changeDetectorRef: ChangeDetectorRef;

  set autoLoadData(value: false | IAutoLoadDataConfig) {
    this.config.autoLoadData = value;
  }

  set subscribeToConnections(value: boolean) {
    this.config.subscribeToConnections = value;
  }

  get subscribeToConnections() {
    return this.config.subscribeToConnections;
  }

  get loading() {
    if (this.loadingHandler && this.loadingHandler !== this) {
      return this.loadingHandler.loading;
    }

    return this._loading;
  }

  get initializing() {
    if (this.loadingHandler && this.loadingHandler !== this) {
      return this.loadingHandler.initializing;
    }

    return this._initializing;
  }


  get route(): ActivatedRoute {
    if (!this._route)
      throw new Error('Please provide valid activated route');

    return this._route;
  }

  set route(value: ActivatedRoute) {
    this._route = value;
  }

  protected _router: Router;

  set router(router: Router) {
    this._router = router;
  }
  get router(): Router {
    if (!this._router) {
      throw new Error('Please provide valid router');
    }

    return this._router;
  }

  protected _repository?: Repository<I>;

  get repository(): Repository<I> {
    if (!this._repository)
      throw new Error('Please provide valid repository');

    return this._repository;
  }

  set repository(value: Repository<I>) {
    this._repository = value;
  }

  protected _notifier?: NotifierService;

  protected get notifier(): NotifierService {
    if (!this._notifier)
      throw new Error('Please provide valid notifier');

    return this._notifier;
  }

  protected set notifier(value: NotifierService) {
    console.log('notifier', value);
    this._notifier = value;
  }

  protected _injector?: Injector;

  protected _accountsManager: AccountsManager;

  protected _repositorySubscription: Subscription;

  initDepndencies() {
    const injector = this._injector;

    if (!injector)
      return;

    this._route = injector.get(ActivatedRoute);
    this._router = injector.get(Router);
    this._accountsManager = injector.get(AccountsManager);
    this.notifier = injector.get(NotifierService, null);
  }

  ngOnInit(): void {
    this.initDepndencies();
    const loadData = this.config.autoLoadData || {};
    if (loadData?.onInit)
      this.loadData();

    if (loadData?.onParamsChange)
      this.route.params
        .pipe(untilDestroyed(this))
        .subscribe((params) => this._onParamsChanged(params));

    if (loadData?.onQueryParamsChange)
      this.route.queryParams
        .pipe(untilDestroyed(this))
        .subscribe((params) => this._onQueryParamsChanged(params));

    if (this.config.subscribeToRepository) {
      this._repositorySubscription?.unsubscribe();
      this._repositorySubscription = this._subscribeToRepository();
    }

    // if (this.subscribeToConnections)
    //   this._accountsManager.subscribe(this);

    // this.subscribeToRealtime();
  }

  // handleConnect(connection: IConnection) {
  //   super.handleConnect(connection);

  //   this._repositorySubscription = this._subscribeToRepository();
  // }

  // handleDisconnect(connection: IConnection) {
  //   super.handleDisconnect(connection);

  //   this._repositorySubscription?.unsubscribe();
  // }

  protected _subscribeToRepository(): Subscription {
    if (!this._repository) {
      return;
    }

    return this.repository.actions
      .pipe(untilDestroyed(this))
      .subscribe(({ action, items }) => {
        switch (action) {
          case RepositoryAction.Create:
            this._handleCreateItems(items);
            break;
          case RepositoryAction.Update:
            this._handleUpdateItems(items);
            break;
          case RepositoryAction.Delete:
            this._handleDeleteItems(items);
            break;
        }
      });
  }


  subscribeToRealtime() {
    // if (this._provider) {
    //     if (this.provider.delete$)
    //         this.provider.delete$.pipe(untilDestroyed(this))
    //             .subscribe(res => this._handleRealtimeDeleteItem(res));

    //     if (this.provider.update$)
    //         this.provider.update$.pipe(untilDestroyed(this))
    //             .subscribe(res => this._handleRealtimeUpdateItem(res));

    //     if (this.provider.create$)
    //         this.provider.create$.pipe(untilDestroyed(this))
    //             .subscribe(res => this._handleRealtimeCreateItem(res));
    // }
  }

  /**
   * @params.event - set when you want to prevent default
   */
  deleteItem(item: I, event?) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const hide = this.showLoading();
    this._deleteItem(item)
      .pipe(finalize(hide))
      .subscribe(
        () => {
          this._handleDeleteItems([item]);
          this._showSuccessDelete();
        },
        err => {
          this._handleDeleteError(err);
        },
      );
  }

  protected _deleteItem({ id }: I) {
    return this.repository.deleteItem(id);
  }

  loadData(params?: any) { }

  showLoading(initializing = false): HideLoader {
    if (this.loadingHandler && this.loadingHandler !== this) {
      return this.loadingHandler.showLoading(initializing);
    }

    this._loadingProcesses++;
    this._loading = true;
    this._initializing = initializing;

    this.timeBeforeLoadingStart = this.timeBeforeLoadingStart || Date.now();

    return () => {
      if (this._loadingProcesses <= 0)
        return;

      if (--this._loadingProcesses === 0) {
        const time = Date.now();
        const diff = time - this.timeBeforeLoadingStart;
        this.timeBeforeLoadingStart = 0;

        setTimeout(() => {
          if (this._loadingProcesses === 0) {
            this._loading = false;
            this._initializing = false;
          }
        }, diff < this.MIN_LOADING_TIME ? this.MIN_LOADING_TIME - diff : 0);
      }
    };
  }

  protected _showSuccessDelete() {
    this.showSuccess('action.successfully-deleted');
  }

  protected _handleDeleteError(error: Error) {
    this.showError(error, 'action.delete-error');
  }

  protected _handleLoadingError(error: Error) {
    this.loadingError = (error as HttpErrorResponse)?.status ?? null;
    return undefined;
  }

  // protected _handleRealtimeUpdateItem(message: IRealtimeMessage<I>) {
  //     if (message && message.payload)
  //         this._handleUpdateItem(message.payload);
  // }

  protected _handleUpdateItems(items: I[]) {
    console.warn('Implement _handleUpdateItem');
    this.detectChanges();
  }

  // protected _handleRealtimeCreateItem(message: IRealtimeMessage<I>) {
  //     if (message && message.payload && this.needHandleCreateItem(message.payload))
  //         this._handleCreateItem(message.payload);
  // }

  // needHandleCreateItem(item: I) {
  //     return true;
  // }

  protected _handleCreateItems(item: I[]) {
    console.warn('Implement _handleCreateItem');
    this.detectChanges();
  }

  // protected _handleRealtimeDeleteItem(message: IRealtimeMessage<IBaseItem>) {
  //     if (message && message.payload)
  //         this._handleDeleteItem(message.payload);
  // }

  protected _handleDeleteItems(items: IBaseItem[]) {
    this._navigateOnSuccessAction();
    this.detectChanges();
  }

  protected _navigateOnSuccessAction(item?: T) {
    // window.history.back();
  }

  protected _onQueryParamsChanged(params?: any) {
    if (this.isQueryParamsChanged(this._queryParams, params)) {
      this._queryParams = params;
      this.loadData(params);
    }
  }

  protected _onParamsChanged(params?: any) {
    this.loadData(params);
  }

  protected isQueryParamsChanged(oldParams: any, params: any): boolean {
    return !isEqual(oldParams, params);
  }

  showSuccess(messageOrKey: string) {
    // this.notifier.showSuccess(this._getTranslateKey(messageOrKey));
    this.notifier.showSuccess('Success');
  }

  showError(messageOrKey: any, defaultMessage?) {
    // this.notifier.showError(this._getTranslateKey(messageOrKey), this._getTranslateKey(defaultMessage));
    this.notifier.showError(this._getTranslateKey(messageOrKey), 'Error');
  }

  protected _getTranslateKey(key) {
    return key;
  }

  detectChanges() {
    if (!this._changeDetectorRef)
      return;

    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy', this.constructor.name);
    if (this._repositorySubscription?.unsubscribe)
      this._repositorySubscription.unsubscribe();
  }
}
