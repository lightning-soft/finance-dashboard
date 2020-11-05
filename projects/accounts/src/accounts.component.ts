import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GroupItemsBuilder, ItemsComponent } from 'base-components';
import { Broker, ConnectionsRepository, IConnection } from 'communication';

@UntilDestroy()
@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent extends ItemsComponent<IConnection> implements OnInit {

  builder = new GroupItemsBuilder();

  form: FormGroup;
  isLoading = false;

  brokers: any[] = [
    {
      key: Broker.Rithmic,
      title: 'Rithmic',
    },
  ];

  selectedItem: IConnection = null;

  constructor(
    protected _repository: ConnectionsRepository,
    protected _injector: Injector,
    private fb: FormBuilder,
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
    });
  }

  openCreateForm(event: MouseEvent, broker: Broker) {
    event.stopPropagation();

    this.form.reset();

    this.selectedItem = { broker } as IConnection;
  }

  selectItem(item: IConnection) {
    this.selectedItem = item;

    this.form.reset();

    const value = Object.keys(this.form.value).reduce((accum, key) => {
      accum[key] = item[key];

      return accum;
    }, {});

    this.form.setValue(value);
  }

  handleSubmit() {
    const action = !this.selectedItem.id ? 'createItem' : 'connect';

    this._request(action);
  }

  disconnect() {
    this._request('disconnect');
  }

  private _request(action: string) {
    this.isLoading = true;

    this._repository.switch(this.selectedItem.broker);

    this._repository[action]({ ...this.selectedItem, ...this.form.value })
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          this.form.reset();
          this.isLoading = false;
        },
        (res) => {
          this.notifier.showError(res.error.error.message);
          this.isLoading = false;
        },
      );
  }
}
