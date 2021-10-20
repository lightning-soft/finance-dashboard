import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { GroupItemsBuilder } from 'base-components';
import { ILayoutNode, IStateProvider, LayoutNode } from 'layout';
import { NzContextMenuService, NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { finalize, tap } from 'rxjs/operators';
import { BrokersRepository, IBroker, IConnection } from 'trading';
import { AcccountFormComponent } from './acccount-form/acccount-form.component';

export interface AccountsComponent extends ILayoutNode {
}

interface AccountsState {
  selectedItem?: IConnection;
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
  builder = new GroupItemsBuilder<IConnection>();
  form: FormGroup;
  isLoading: { [key: number]: boolean } = {};
  selectedItem: IConnection;
  brokers: IBroker[];
  selectedBroker: IBroker;
  @ViewChild('userData') userData: AcccountFormComponent;
  isSubmitted = false;
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
  }

  ngOnInit() {
    this.builder.setParams({
      groupBy: ['broker'],
    });

    this._accountsManager.connectionsChange
      .pipe(untilDestroyed(this))
      .subscribe(connections => {
        this.builder.replaceItems(connections);
        if (!this.selectedItem && connections.length) {
          const index = 0;
          this.selectItem(connections[index], index);
        } else {
          this._updateSelectedItem();
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
          this._updateSelectedItem();
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
    if (!autosave) {
      this.form.controls.connectOnStartUp.setValue(false);
      this.selectedItem.connectOnStartUp = false;
    }

    this.selectedItem.autoSavePassword = autosave;
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
    return { selectedItem: this.selectedItem };
  }

  loadState(state: AccountsState) {
    const { selectedItem } = state;
    if (selectedItem) {
      this.selectItem(selectedItem);
      this._updateSelectedItem();
    }
  }

  private _updateConnection(connection: IConnection): void {
    this._accountsManager.updateItem({ ...connection })
      .pipe(this.showItemLoader(connection), untilDestroyed(this))
      .subscribe({
        error: (error) => {
          this._notifier.showError(error);
        }
      });
  }

  private _updateSelectedItem(): void {
    if (this.selectedItem) {
      const item = this.builder.items.find(data => data.id === this.selectedItem.id);
      if (item)
        this.selectedItem = { ...item };
    }
  }

  getConnectionsByBroker(broker: IBroker): IConnection[] {
    return this.builder.getItems('broker', broker?.name);
  }

  canAddAccount(broker: IBroker): boolean {
    return this.getConnectionsByBroker(broker).length < maxAccountsPerConnection;
  }

  expandBrokers(): void {
    if (!Array.isArray(this.brokers) || !this.selectedItem)
      return;

    this.selectedBroker = this.brokers.find(i => i.name == this.selectedItem?.broker);
  }

  handleBrockerClick($event, broker: IBroker): void {
    if (!this.getConnectionsByBroker(broker).length && this.canAddAccount(broker)) {
      this.openCreateForm($event, broker);
    }
  }

  openCreateForm(event: MouseEvent, broker: IBroker): void {
    event?.stopPropagation();
    if (this.canAddAccount(broker)) {
      const item = { broker: broker.name } as IConnection;
      this.selectItem(item);
    }
  }

  selectItem(item: IConnection, index = -1): void {
    this.selectItemIndex = index;
    this.selectedItem = item;
    this.expandBrokers();
    this.isSubmitted = false;
    this.form.reset(item ? this.convertItemToFormValue(item, this.selectedBroker) : undefined);
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
    this.isSubmitted = true;
    if (!this.userData?.isValid) {
      return;
    }
    if (!this.selectedItem.id) {
      this.create();
    } else {
      this.connect();
    }
  }

  getValue() {
    const value = this.form.value;
    const { userData, ...data } = value;
    return {
      ...this.selectedItem, ...data,
      broker: this.selectedBroker?.name,
      name: this.selectedItem.name, ...userData
    };
  }

  create() {
    this._accountsManager.createConnection(this.getValue())
      .pipe(this.showItemLoader(this.selectedItem), untilDestroyed(this))
      .subscribe(
        (item: IConnection) => {
          this.expandBrokers();
          this.selectItem(item);
          this.connect();
        },
        err => this._notifier.showError(err),
      );
  }

  rename(name: string, item: IConnection): void {
    this._updateConnection({ ...item, name });
  }

  updateItem() {
    return this._accountsManager.updateItem(this.getValue())
      .pipe(this.showItemLoader(this.selectedItem),
        tap((item: any) => {
          if (!item.error)
            this.selectedItem = item;
          else {
            this._notifier.showError(item.err, 'Failed to save item');
          }
        }),
        untilDestroyed(this),
      ).toPromise();
  }

  connect() {
    return this._accountsManager.connect(this.getValue())
      .pipe(this.showItemLoader(this.selectedItem),
        tap((item: any) => {
          if (!item.error) {
            this.selectedItem = item;
            
            if (!this.existDefaultConnection) {
              this.selectFreeConnectionAsDefault();
            }
          }
        }),
        untilDestroyed(this),
      ).toPromise();
  }

  disconnect(item: IConnection) {
    this._disconnect(item)
      .subscribe(
        () => {
          this.selectedItem = { ...item, connected: false };
        },
        err => this._notifier.showError(err),
      );
      if (!this.existDefaultConnection) {
        this.selectFreeConnectionAsDefault();
      }
  }

  makeDefault(item: IConnection, index = -1) {
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

  _disconnect(item: IConnection) {
    return this._accountsManager.disconnect(item)
      .pipe(this.showItemLoader(item), untilDestroyed(this));
  }

  delete(event: MouseEvent, item: IConnection) {
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
          .pipe(this.showItemLoader(item), untilDestroyed(this))
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

  toggleFavourite(event: MouseEvent, item: IConnection) {
    event.stopPropagation();

    this._accountsManager.toggleFavourite(item)
      .pipe(this.showItemLoader(item), untilDestroyed(this))
      .subscribe(
        () => {
        },
        err => this._notifier.showError(err),
      );
  }

  showItemLoader(item: IConnection) {
    const id = item.id;
    this.isLoading[id] = true;

    return finalize(() => delete this.isLoading[id]);
  }

  toggleFormConnection($event: boolean, control: string) {
    if ($event)
      this.form.get(control).enable();
    else
      this.form.get(control).disable();
  }
}
