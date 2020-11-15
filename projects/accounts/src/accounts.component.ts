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

  builder = new GroupItemsBuilder<IConnection>();
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
        res => {
          this.brokers = res.data;
          this.expandBrokers();
        },
        err => this._notifier.showError(err)
      );

    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe(items => {
        this.builder.replaceItems(items);
        this.expandBrokers();
      });
  }

  expandBrokers() {
    if (!this.brokers) {
      return;
    }

    this.brokers.map(broker => {
      const hasActiveConnections = !!this.builder.getItems('broker', broker.name)
        .find(i => i.connected);

      if (hasActiveConnections) {
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
    this.selectedBroker = item ? this.brokers.find(b => b.name === item.broker) : null;

    if (item) {
      this.form.reset(item);
    } else {
      this.form.reset();
    }
  }

  handleSubmit() {
    if (!this.selectedItem.id) {
      this.create();
    } else {
      this.connect();
    }
  }

  create() {
    this._accountsManager.createConnection(this.form.value)
      .pipe(this.showItemLoader(this.selectedItem), untilDestroyed(this))
      .subscribe(
        (item: IConnection) => {
          this.selectItem(item);
          this.connect();
        },
        err => this._notifier.showError(err),
      );
  }

  connect() {
    this._accountsManager.connect(this.form.value)
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
        this._accountsManager.deleteConnection(item)
          .pipe(this.showItemLoader(item), untilDestroyed(this))
          .subscribe(
            () => {
              this.selectItem(null);
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
        () => {},
        err => this._notifier.showError(err),
      );
  }

  showItemLoader(item: IConnection) {
    const id = item.id;
    this.isLoading[id] = true;

    return finalize(() => delete this.isLoading[id]);
  }
}
