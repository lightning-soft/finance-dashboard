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
    this.setTabIcon('icon-indicator');
  }


  ngOnInit() {
    this.builder.setParams({groupBy: ['broker']});

    this.form = this.fb.group({
      id: [null],
      name: [null],
      marketConnection: [null],
      orderConnection: [null],
      userData: [null],
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
          if (this.brokers?.length && !this.selectedItem)
            this.selectItem({broker: this.brokers[0]} as any);
        },
        err => this._notifier.showError(err)
      );

    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(items => {
        this.builder.replaceItems(items);
        this.expandBrokers();
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
    if (!this.brokers) {
      return;
    }

    this.brokers.map(broker => {
      const hasActiveConnections = !!this.getBrokerItems(broker)
        .find(i => i.connected);
      const hasManyChildren = this.getBrokerItems(broker).length > 2;
      if (hasActiveConnections || hasManyChildren) {
        (broker as any).active = true;
      }

      return broker;
    });
  }

  openCreateForm(event: MouseEvent, broker: Broker) {
    event.stopPropagation();

    this.selectItem({ broker } as IConnection);
  }

  selectItem(item: IConnection) {
    this.selectedItem = item;
    this.selectedBroker = item ? this.brokers?.find(b => b.name === item.broker) : null;

    if (item) {
      this.form.reset(this.convertItemToFormValue(item));
    } else {
      this.form.reset();
    }
  }

  convertItemToFormValue(item: IConnection) {
    const {username, password, connectionPointId, gateway, ...data} = item;
    const userData = {username, password, connectionPointId, gateway};
    return {...data, userData};
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
    console.log(value);
    const {userData, ...data} = value;
    console.log({...data, ...userData});
    return {...data, ...userData};
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
      ).subscribe((response: any) => {
      const index = this.builder.items.findIndex(item => item.id === response.id);
      this.builder.updateItem(response, index);
      this.builder.updateGroupItems();
    });
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

  disconnect() {
    const item = this.selectedItem;

    this._accountsManager.disconnect(item)
      .pipe(this.showItemLoader(item), untilDestroyed(this))
      .subscribe(
        () => {
          this.selectedItem = {...item, connected: false};
        },
        err => this._notifier.showError(err),
      );
  }

  delete(event: MouseEvent, item: IConnection) {
    event.stopPropagation();

    this.modal.confirm({
      nzWrapClassName: 'custom-confirm',
      nzIconType: '',
      nzContent: `Are you sure want to delete connection ${ item.name }?`,
      nzOkText: 'Delete',
      nzCancelText: 'Cancel',
      nzAutofocus: null,
      nzOnOk: () => {
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
        () => { },
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
