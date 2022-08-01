import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager, Connection } from 'accounts-manager';
import { GroupItemsBuilder, Id } from 'base-components';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { NzContextMenuService, NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { take } from 'rxjs/operators';
import { BrokersRepository, IBroker, IConnection } from 'trading';
import { AccountFormComponent } from './account-form/account-form.component';

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
  userData: AccountFormComponent;
  isSubmitted = false;

  disableDefaultChange = false;

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
    protected _cd: ChangeDetectorRef,
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
      name: [''],
      // marketConnection: [null, Validators.required],
      // orderConnection: [null, Validators.required],
      userData: [null, Validators.required],
      // server: [null, Validators.required],
      broker: [null],
      aggregatedQuotes: [null],
      autoSavePassword: [null],
      connectOnStartUp: [null],
    });
    this.selectItem(_accountsManager.getNewConnection());
    (window as any).accountsComponent = this;
  }

  ngOnInit() {
    this.builder.setParams({
      groupBy: ['broker'],
    });

    this._accountsManager.connectionsChange
      .pipe(untilDestroyed(this))
      .subscribe(connections => {
        const removeConnections = connections.filter(item => typeof item.broker !== 'string');
        this.disableDefaultChange = connections.filter(item => item.connected).length <= 1;
        if (removeConnections.length) {
          removeConnections.forEach(i => this._accountsManager.remove(i)
            .subscribe(
              () => console.log('connection removed', i),
              (err) => console.log('connection removed error', err),
            ));
        }

        const _conns = connections.filter(item => item.broker != null);
        this.builder.replaceItems(_conns);
        if (!this.selectedItem && _conns.length) {
          const index = 0;
          this.selectItem(_conns[index]);
        }

        this.expandBrokers();
        this._cd.detectChanges();
      });

    this._brokersRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(
        res => {
          const indexDefaultBroker = 0;
          this.brokers = res.data;
          if (this.brokers.length) {
            this.selectItem(this.getConnectionsByBroker(this.brokers[indexDefaultBroker])[indexDefaultBroker]);
          }

          if (this.selectedItem) {
            this.expandBrokers();
            return;
          }
          if (this.builder.items.length >= maxAccountsPerConnection) {
            const index = 0;
            this.selectItem(this.builder.items[index]);
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
    // this.form.valueChanges
    //   .pipe(untilDestroyed(this))
    //   .subscribe(value => {
    //     if (this.form.invalid)
    //       return;

    //     // this.selectedItem.save(value)
    //     //   .pipe(untilDestroyed(this))
    //     //   .subscribe(
    //     //     (item: Connection) => { },
    //     //     err => this._notifier.showError(err),
    //     //   );
    //   });
    this.form.controls.connectOnStartUp.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(connect => {
        if (connect) {
          this.userData?.makeAutoSave();
          this._cd.detectChanges();
        } else if (this.selectedItem.connectOnStartUp)  {
          this.selectedItem.update({ connectOnStartUp: false }).toPromise();
        }
      });
  }

  autoSavePasswordChange(autosave: boolean): void {
    if (!autosave) {
      this.form.controls.connectOnStartUp.patchValue(false);
    }
  }

  contextMenu($event: MouseEvent, menu: any): void {
    this.nzContextMenuService.create($event, menu);
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
    this._cd.detectChanges();
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
      this.selectItem(item, true);
    }
  }

  selectItem(item: Connection, clearSubmit = false): void {
    if (clearSubmit)
      this.isSubmitted = false;

    if (item) {
      item.destroyIfNew();
    }

    this.selectedItem = item;
    this.expandBrokers();
    const json = item?.toJson();
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
    return { ...data, broker: broker?.name, userData };
  }

  handleSubmit(): void {
    this.isSubmitted = true;
    if (this.form.invalid)
      return;

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
      .subscribe(() => {
          this.selectItem(connection);
          this.expandBrokers();
          // this.connect();
        },
        err => this._notifier.showError(err),
      );
  }

  rename(name: string, item: Connection): void {
    item.rename(name)
      .pipe(untilDestroyed(this))
      .subscribe({
        error: (error) => this._notifier.showError(error)
      });
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

  makeDefault(item: Connection) {
    this._accountsManager.makeDefault(item).subscribe(
      (response: any) => {
      },
      err => this._notifier.showError(err),
    );
  }

  selectFreeConnectionAsDefault(): void {
    for (const broker of this.brokers) {
      for (const item of this.getConnectionsByBroker(broker)) {
        if (item.connected && !item.isDefault) {
          this.makeDefault(item);
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
              this.selectItem(this.builder.items[index]);
            },
            err => this._notifier.showError(err),
          );
      },
    });
  }

  toggleFavorite(event: MouseEvent, item: Connection) {
    event.stopPropagation();

    item.toggleFavorite()
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
