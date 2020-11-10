import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { GroupItemsBuilder } from 'base-components';
import { NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { finalize } from 'rxjs/operators';
import { Broker, BrokersRepository, IBroker, IConnection } from 'trading';

@UntilDestroy()
@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {

  builder = new GroupItemsBuilder();
  form: FormGroup;
  isLoading: { [key: number]: boolean } = {};
  selectedItem: IConnection;
  brokers: IBroker[];
  selectedBroker: IBroker;

  constructor(
    protected _accountsManager: AccountsManager,
    protected _injector: Injector,
    protected _notifier: NotifierService,
    private _brokersRepository: BrokersRepository,
    private fb: FormBuilder,
    private modal: NzModalService,
  ) {
  }

  ngOnInit() {
    this.builder.setParams({ groupBy: ['broker'] });

    this.form = this.fb.group({
      id: [null],
      name: [null],
      username: [null],
      password: [null],
      connectionPointId: [null],
      aggregatedQuotes: [null],
      gateway: [null],
      autoSavePassword: [null],
      connectOnStartUp: [null],
      broker: [null],
    });

    this._brokersRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(
        res => this.brokers = res.data,
        err => this._notifier.showError(err)
      );

    this._accountsManager.connections
      .subscribe(items => this.builder.replaceItems(items));
  }

  openCreateForm(event: MouseEvent, broker: Broker) {
    event.stopPropagation();

    this.form.reset({ broker });

    this.selectedItem = { broker } as IConnection;
    this.selectBroker(broker);
  }

  selectItem(item: IConnection) {
    if (!item) {
      this.selectedItem = null;
      this.selectedBroker = null;


      const value = Object.keys(this.form.controls).reduce((accum, key) => {
        accum[key] = item[key] || null;

        return accum;
      }, {});

      const broker = item.broker;
      this.selectBroker(broker); // todo

      this.form.setValue({
        ...value,
        broker: broker ?? null,
      });
    } else {
      this.selectedItem = item;
      this.form.reset(item);
    }
  }

  selectBroker(broker: Broker) {
    this.selectedBroker = this.brokers.find(b => b.name === broker);
  }

  handleSubmit() {
    if (!this.selectedItem.id) {
      this.create();
    } else {
      this.connect();
    }
  }

  create() {
    return this._accountsManager.createConnection(this.form.value)
      .pipe(this.showItemLoader(this.selectedItem))
      .subscribe(
        (item: any) => {
          console.log(item);
          // this.builder.handleCreateItems([item]);
          this.selectItem(item);
          this.connect();
        },
        err => this._notifier.showError(err));
  }

  connect() {
    return this._accountsManager.connect(this.form.value)
      .pipe(this.showItemLoader(this.selectedItem))
      .subscribe(
        (data: IConnection) => {
          const item = { ...this.selectedItem, connected: true, connectionData: data.connectionData };
          // this.builder.handleUpdateItems([item]);
          this.selectedItem = item;
        },
        err => this._notifier.showError(err)
      );
  }

  disconnect() {
    return this._accountsManager.disconnect(this.selectedItem)
      .pipe(this.showItemLoader(this.selectedItem))
      .subscribe(
        () => {
          const _item = this.selectedItem;
          this.selectedItem = { ..._item, connected: false };
          // this.builder.handleUpdateItems([this.selectedItem]);
        },
        err => this._notifier.showError(err)
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
        return this._accountsManager.deleteConnection(item)
          .pipe(this.showItemLoader(item))
          .subscribe(
            (_item) => {
              // this.builder.handleDeleteItems([item]);
              console.log(item);
            },
            err => this._notifier.showError(err)
          );
      },
    });
  }

  toggleFavourite(event: MouseEvent, item: IConnection) {
    event.stopPropagation();

    return this._accountsManager.toggleFavourite({ ...item, favourite: !item.favourite })
      .pipe(this.showItemLoader(item))
      .subscribe(
        (item: any) => {
          // this.builder.replaceItems([item]);
          console.log(item);
        },
        err => this._notifier.showError(err)
      );
  }

  showItemLoader(item: IConnection) {
    const id = item.id;
    this.isLoading[id] = true;

    return finalize(() => delete this.isLoading[id]);
  }
}
