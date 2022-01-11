import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager, Connection } from 'accounts-manager';
import { GroupItemsBuilder, Id } from 'base-components';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { NzContextMenuService, NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { take, tap } from 'rxjs/operators';
import { BrokersRepository, IBroker, IConnection } from 'trading';
import { AcccountFormComponent } from './acccount-form/acccount-form.component';

export interface AccountsComponent extends ILayoutNode {
}

interface AccountsState {
  selectedItemId?: Id;
}

const maxAccountsPerConnection = 4;

@UntilDestroy()
@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
@LayoutNode()
export class AccountsComponent implements IStateProvider<AccountsState>, OnInit, AfterViewInit {
  builder = new GroupItemsBuilder<Connection>();
  form: FormGroup;
  selectedItem: Connection;
  brokers: IBroker[];
  selectedBroker: IBroker;
  @ViewChild('userData')
  userData: AcccountFormComponent;

  connectOnStartUp = true;

  selectItemIndex = -1;

  get existDefaultConnection(): boolean {
    for (const broker of this.brokers) {
      for (const item of this.getConnectionsByBroker(broker)) {
        if (item.connected && item.isDefault) {
          return true;
        }
      }
    }

    return false;
  }

  constructor(
    protected _accountsManager: AccountsManager,
    protected _injector: Injector,
    protected _notifier: NotifierService,
    private _brokersRepository: BrokersRepository,
    private fb: FormBuilder,
    private modal: NzModalService,
    protected nzContextMenuService: NzContextMenuService
  ) {
    this.setTabTitle('Connections');
    this.setTabIcon('icon-signal');
    this.form = this.fb.group({
      id: [null],
      name: [null],
      marketConnection: [null],
      orderConnection: [null],
      userData: [null],
      server: [null],
      aggregatedQuotes: [null],
      autoSavePassword: [null],
      connectOnStartUp: [null],
      broker: [null],
    });
    this.selectedItem = _accountsManager.getNewConnection();
    (window as any).accountsComponent = this;
  }

  ngOnInit() {
    this.builder.setParams({
      groupBy: ['broker'],
    });

    this._accountsManager.connectionsChange
      .pipe(untilDestroyed(this))
      .subscribe(connections => {
        const _conns = connections.filter(item => item.broker != null);
        this.builder.replaceItems(_conns);
        if (!this.selectedItem && _conns.length) {
          const index = 0;
          this.selectItem(_conns[index], index);
        }

        this.expandBrokers();
      });

    this._brokersRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(
        res => {
          this.brokers = res.data;
          if (this.selectedItem) {
            this.expandBrokers();
            return;
          }
          if (this.builder.items.length >= maxAccountsPerConnection) {
            const index = 0;
            this.selectItem(this.builder.items[index], index);
          } else if (this.brokers.length) {
            const index = 0;
            this.openCreateForm(null, this.brokers[index]);
          }

          this.expandBrokers();
        },
        err => this._notifier.showError(err)
      );
  }

  ngAfterViewInit() {
    this.form.controls.connectOnStartUp.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(connect => {
        this.connectOnStartUp = connect;
        if (connect) {
          this.selectedItem.autoSavePassword = true;
          this.userData?.form?.controls?.autoSavePassword?.setValue(true);
        }

        this.selectedItem.connectOnStartUp = connect;
      });
  }

  handleAutosavePasswordToggle(autosave: boolean): void {
    this.selectedItem.autoSavePassword = autosave;
    if (!autosave) {
      this.turnOffAutoConnect();
      this.selectedItem.connectOnStartUp = false;
      this.selectedItem.autoSavePassword = false;
      this.form.controls.userData.patchValue({ connectOnStartUp: false });
      this.form.controls.connectOnStartUp.patchValue(false);
      this.form.controls.autoSavePassword.patchValue(false);
    }

  }

  turnOffAutoConnect(): void {
    this.connectOnStartUp = false;
  }

  contextMenu($event: MouseEvent, menu: any): void {
    this.nzContextMenuService.create($event, menu);
  }

  save() {
    this._updateConnection({ ...this.selectedItem });
  }

  saveState(): AccountsState {
    return { selectedItemId: this.selectedItem.id };
  }

  loadState(state: AccountsState) {
    const { selectedItemId } = state;

    this._accountsManager.connectionsChange
      .pipe(untilDestroyed(this), take(1))
      .subscribe((connections) => {
        console.log('loadState ', connections);
        const connection = connections.find(i => i.id === selectedItemId);
        if (!connection) {
          this.expandBrokers();
          return;
        }
        this.selectItem(connection);
      });
  }

  private _updateConnection(connection: IConnection): void {
    this._accountsManager.updateItem({ ...connection })
      .pipe(untilDestroyed(this))
      .subscribe({
        error: (error) => {
          this._notifier.showError(error);
        }
      });
  }

  getConnectionsByBroker(broker: IBroker): Connection[] {
    return this.builder.getItems('broker', broker?.name);
  }

  canAddAccount(broker: IBroker): boolean {
    return this.getConnectionsByBroker(broker).length < maxAccountsPerConnection;
  }

  expandBrokers(): void {
    if (!Array.isArray(this.brokers))
      return;

    this.selectedBroker = this.brokers.find(i => i.name === this.selectedItem?.broker) ?? this.brokers[0];
  }

  handleBrockerClick($event, broker: IBroker): void {
    if (!this.getConnectionsByBroker(broker).length && this.canAddAccount(broker)) {
      this.openCreateForm($event, broker);
    }
  }

  openCreateForm(event: MouseEvent, broker: IBroker): void {
    event?.stopPropagation();
    if (this.canAddAccount(broker)) {
      const item = this._accountsManager.getNewConnection({ broker: broker.name });
      this.selectItem(item);
    }
  }

  selectItem(item: Connection, index = -1): void {
    this.selectItemIndex = index;
    this.selectedItem = item;
    this.expandBrokers();
    const json = item.toJson();
    this.form.reset(json ? this.convertItemToFormValue(json, this.selectedBroker) : undefined);
  }

  convertItemToFormValue(item: IConnection, broker: IBroker) {
    const _server: any = item.server;
    let server;
    if (typeof _server === 'string')
      server = _server;
    else if ((typeof _server === 'object'))
      server = _server.name;

    const { username, password, autoSavePassword, gateway, ...data } = item;
    const userData = { username, password: autoSavePassword ? password : '', server, gateway, autoSavePassword };
    return { ...data, broker, userData };
  }

  handleSubmit(): void {
    if (!this.userData?.isValid) {
      return;
    }
    if (!this.selectedItem.id) {
      this.create();
    } else {
      this.connect();
    }
  }

  getConnection(): Connection {
    const value = this.form.value;
    const { userData, ...data } = value;

    this.selectedItem.applyJson({
      ...data,
      broker: this.selectedBroker?.name,
      name: this.selectedItem.name,
      ...userData
    });

    return this.selectedItem;
    // return {
    //   ...this.selectedItem,
    //   ...data,
    //   broker: this.selectedBroker?.name,
    //   name: this.selectedItem.name,
    //   ...userData
    // };
  }

  create() {
    const connection = this.getConnection();
    this._accountsManager.createConnection(connection)
      .pipe(untilDestroyed(this))
      .subscribe(
        (item: Connection) => {
          this.selectItem(connection);
          this.expandBrokers();
          this.connect();
        },
        err => this._notifier.showError(err),
      );
  }

  rename(name: string, item: IConnection): void {
    this._updateConnection({ ...item, name });
  }

  updateItem() {
    return this._accountsManager.updateItem(this.getConnection())
      .pipe(
        untilDestroyed(this),
        tap((item: any) => {
          this._notifier.showError(item.err, 'Failed to save item');
        }),
        untilDestroyed(this),
      ).toPromise();
  }

  connect() {
    return this._accountsManager.connect(this.getConnection())
      .pipe(untilDestroyed(this)).subscribe(
        (item: any) => {
          if (!item.error && !this.existDefaultConnection) {
            this.selectFreeConnectionAsDefault();
          }
        });
  }

  disconnect(item: Connection) {
    this._accountsManager.disconnect(item)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          if (!this.existDefaultConnection) {
            this.selectFreeConnectionAsDefault();
          }
        },
        err => this._notifier.showError(err),
      );
  }

  makeDefault(item: Connection, index = -1) {
    this._accountsManager.makeDefault(item).subscribe(
      (response: any) => {
        this._updateSelectItemIndex(item);

        const itemList = this.getConnectionsByBroker(this.selectedBroker);
        if (index !== -1) this.selectItemIndex = index;
        this.selectItem(itemList[this.selectItemIndex], this.selectItemIndex);
      },
      err => this._notifier.showError(err),
    );
  }

  private _updateSelectItemIndex(item: IConnection): void {
    if (this.selectItemIndex === -1) {
      this.selectItemIndex = this.getConnectionsByBroker(this.selectedBroker).findIndex(i => i.name === item.name);
    }
  }

  selectFreeConnectionAsDefault(): void {
    for (const broker of this.brokers) {
      for (const item of this.getConnectionsByBroker(broker)) {
        if (item.connected && !item.isDefault) {
          this.makeDefault(item, this.selectItemIndex);
          return;
        }
      }
    }
  }

  delete(event: MouseEvent, item: Connection) {
    event.stopPropagation();

    this.modal.confirm({
      nzWrapClassName: 'custom-confirm',
      nzIconType: '',
      nzContent: `Do you want to delete ${item.name}?`,
      nzOkText: 'Delete',
      nzCancelText: 'Cancel',
      nzAutofocus: null,
      nzOnOk: () => {
        if (item.connected)
          this.disconnect(item);
        this._accountsManager.deleteConnection(item)
          .pipe(untilDestroyed(this))
          .subscribe(
            () => {
              const index = 0;
              this.selectItem(this.builder.items[index], index);
            },
            err => this._notifier.showError(err),
          );
      },
    });
  }

  toggleFavorite(event: MouseEvent, item: Connection) {
    event.stopPropagation();

    this._accountsManager.toggleFavorite(item)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          console.log('toggleFavorite successfully');
        },
        err => this._notifier.showError(err),
      );
  }

  toggleFormConnection($event: boolean, control: string) {
    if ($event)
      this.form.get(control).enable();
    else
      this.form.get(control).disable();
  }
}
