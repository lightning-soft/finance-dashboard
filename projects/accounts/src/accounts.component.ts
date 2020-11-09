import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GroupItemsBuilder, ItemsComponent } from 'base-components';
import { Broker, BrokersRepository, ConnectionsRepository, IBroker, IConnection, Id } from 'communication';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent extends ItemsComponent<IConnection> implements OnInit {

  builder = new GroupItemsBuilder();
  form: FormGroup;
  isLoading: { [key: number]: boolean } = {};
  selectedItem: IConnection;
  brokers: IBroker[];
  selectedBroker: IBroker;

  constructor(
    protected _repository: ConnectionsRepository,
    protected _injector: Injector,
    private _brokersRepository: BrokersRepository,
    private fb: FormBuilder,
    private modal: NzModalService,
  ) {
    super();

    this.autoLoadData = {
      onInit: true,
    };
  }

  ngOnInit() {
    super.ngOnInit();

    this.builder.setParams({
      groupBy: ['broker'],
    });

    this.form = this.fb.group({
      name: [null],
      username: [null],
      password: [null],
      connectionPointId: [null],
      aggregatedQuotes: [null],
      gateway: [null],
      autoSavePassword: [null],
      connectOnStartUp: [null],
    });

    this._brokersRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.brokers = res.data;
      });
  }

  openCreateForm(event: MouseEvent, broker: Broker) {
    event.stopPropagation();

    this.form.reset();

    this.selectedItem = { broker } as IConnection;
    this.selectBroker(broker);
  }

  selectItem(id: Id) {
    this.form.reset();

    const item = this.items.find(i => i.id === id);

    if (!item) {
      this.selectedItem = null;
      this.selectedBroker = null;

      return;
    }

    this.selectedItem = item;
    this.selectBroker(item.broker);

    const value = Object.keys(this.form.controls).reduce((accum, key) => {
      accum[key] = item[key] || null;

      return accum;
    }, {});

    this.form.setValue(value);
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
    this._dispatch((item) => {
      return this._repository.createItem(item);
    });
  }

  connect() {
    this._dispatch((item) => {
      return this._repository.connect(item);
    });
  }

  disconnect() {
    this._dispatch((item) => {
      return this._repository.disconnect(item);
    });
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
        this._dispatch(() => {
          return this._repository.deleteItem(+item.id);
        }, item);
      },
    });
  }

  toggleFavourite(event: MouseEvent, item: IConnection) {
    event.stopPropagation();

    this._dispatch(() => {
      return this._repository.updateItem({ ...item, favourite: !item.favourite });
    }, item);
  }

  private _dispatch(action: (item: IConnection) => Observable<any>, item: IConnection = null) {
    const _item = item || this.selectedItem;
    const { id } = _item;

    this.isLoading[id] = true;

    this._repository.switch(_item.broker);

    action({ ..._item, ...this.form.value })
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          delete this.isLoading[id];
        }),
      )
      .subscribe(
        (res) => {
          const { selectedItem } = this;

          if (item) {
            if (selectedItem) {
              this.selectItem(selectedItem.id);
            }
          } else {
            this.selectItem(selectedItem.id || res.id);
          }
        },
        (res) => {
          this.notifier.showError(res.error.error.message);
        },
      );
  }
}
