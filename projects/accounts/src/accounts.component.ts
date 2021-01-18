import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { GroupItemsBuilder } from 'base-components';
import { ILayoutNode, LayoutNode } from 'layout';
import { NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { finalize, take } from 'rxjs/operators';
import { Broker, BrokersRepository, IBroker, IConnection } from 'trading';

export interface AccountsComponent extends ILayoutNode {
}

const maxAccountsPerConnection = 4;

@UntilDestroy()
@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
@LayoutNode()
export class AccountsComponent implements OnInit {

  builder = new GroupItemsBuilder<IConnection>();
  form: FormGroup;
  isLoading: { [key: number]: boolean } = {};
  selectedItem: IConnection;
  brokers: IBroker[];
  selectedBroker: IBroker;
  splitConnections = false;

  constructor(
    protected _accountsManager: AccountsManager,
    protected _injector: Injector,
    protected _notifier: NotifierService,
    private _brokersRepository: BrokersRepository,
    private fb: FormBuilder,
    private modal: NzModalService,
  ) {
    this.setTabTitle('Connections');
    this.setTabIcon('icon-signal');
  }

  ngOnInit() {
    this.builder.setParams({ groupBy: ['broker'] });

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

    this._brokersRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(
        res => {
          this.brokers = res.data;
          this.expandBrokers();
        },
        err => this._notifier.showError(err)
      );

    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe((items: any) => {
        if (items) {
          this.builder.replaceItems(items);
          this.expandBrokers();
        }
      });

    this._accountsManager.connections.pipe(take(1), untilDestroyed(this))
      .subscribe((items) => {
        const item = items.find(item => item.connected);
        this.selectItem(item);
      });
  }

  getBrokerItems(broker) {
    return this.builder.getItems('broker', broker.name);
  }

  canAddAccount(broker) {
    return this.getBrokerItems(broker).length < maxAccountsPerConnection;
  }

  expandBrokers() {
    if (!Array.isArray(this.brokers) || !this.selectedItem)
      return;

    this.selectedBroker = this.brokers.find(i => i.name == this.selectedItem?.broker)
  }

  handleBrockerClick($event, broker: IBroker) {
    if (!this.getBrokerItems(broker).length && this.canAddAccount(broker)) {
      this.openCreateForm($event, broker);
    }
  }

  openCreateForm(event: MouseEvent, broker: IBroker) {
    event.stopPropagation();

    this.selectItem({ broker: broker.name } as IConnection);
  }

  selectItem(item: IConnection) {
    this.selectedItem = item;
    this.expandBrokers();

    this.form.reset(item ? this.convertItemToFormValue(item, this.selectedBroker) : undefined);
  }

  convertItemToFormValue(item: IConnection, broker) {
    const _server = item.server;
    let server;
    if (typeof _server === 'string')
      server = _server;
    else if ((typeof _server === 'object'))
      server = _server['name'];

    const { username, password, gateway, ...data } = item;
    const userData = { username, password, server, gateway };
    return { ...data, broker, userData };
  }

  handleSubmit() {
    if (!this.selectedItem.id) {
      this.create();
    } else {
      this.connect();
    }
  }

  getValue() {
    const value = this.form.value;
    const { userData, ...data } = value;
    return { ...data, broker: this.selectedBroker.name, ...userData };
  }

  create() {
    this._accountsManager.createConnection(this.getValue())
      .pipe(this.showItemLoader(this.selectedItem), untilDestroyed(this))
      .subscribe(
        (item: IConnection) => {
          this.selectItem(item);
          this.connect();
        },
        err => this._notifier.showError(err),
      );
  }

  rename(name, item) {
    this._accountsManager.rename(name, item)
      .pipe(
        this.showItemLoader(item),
        untilDestroyed(this)
      ).subscribe(
      (response: any) => {
        const index = this.builder.items.findIndex(item => item.id === response.id);
        this.builder.updateItem(response, index);
        this.builder.updateGroupItems();
      },
      err => this._notifier.showError(err),
    );
  }

  connect() {
    this._accountsManager.connect(this.getValue())
      .pipe(this.showItemLoader(this.selectedItem), untilDestroyed(this))
      .subscribe(
        (item: IConnection) => {
          this.selectedItem = item;
        },
        err => this._notifier.showError(err),
      );
  }

  disconnect(item: IConnection) {
    this._accountsManager.disconnect(item)
      .pipe(this.showItemLoader(item), untilDestroyed(this))
      .subscribe(
        () => {
          this.selectedItem = { ...item, connected: false };
        },
        err => this._notifier.showError(err),
      );
  }

  delete(event: MouseEvent, item: IConnection) {
    event.stopPropagation();

    this.modal.confirm({
      nzWrapClassName: 'custom-confirm',
      nzIconType: '',
      nzContent: `Are you sure want to delete connection ${item.name}?`,
      nzOkText: 'Delete',
      nzCancelText: 'Cancel',
      nzAutofocus: null,
      nzOnOk: () => {
        this.disconnect(item);
        this._accountsManager.deleteConnection(item)
          .pipe(this.showItemLoader(item), untilDestroyed(this))
          .subscribe(
            () => this.selectItem(null),
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
