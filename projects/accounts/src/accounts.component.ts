import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountRepository, Broker, BrokerService } from 'communication';
import { TransferItem } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';

@UntilDestroy()
@Component({
  selector: 'accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {

  items: TransferItem[] = [
    {
      key: Broker.Rithmic,
      title: 'Rithmic',
    },
  ];

  constructor(
    protected _route: ActivatedRoute,
    protected _repository: AccountRepository,
    private _brokerService: BrokerService,
    private fb: FormBuilder,
    private notifier: NotifierService,
  ) {}

  ngOnInit() {
    this.items.forEach(item => {
      const { key } = item;

      item.isLoading = false;

      item.form = this.fb.group({
        login: [null],
        password: [null],
      });

      this._brokerService.get(key).handleConnection(connected => {
        item.connected = connected;
      }, this);
    });
  }

  togglePanel(item: TransferItem) {
    item.active = !item.active;
  }

  connect(item: TransferItem) {
    const { login, password } = item.form.value;

    item.isLoading = true;

    this._brokerService.get(item.key).connect(login, password)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          item.form.reset();
          item.active = false;
          item.isLoading = false;
        },
        (error) => {
          this.notifier.showError(error);
          item.isLoading = false;
        },
      );
  }

  disconnect(item: TransferItem) {
    item.isLoading = true;

    this._brokerService.get(item.key).disconnect()
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          item.isLoading = false;
        },
        (res) => {
          this.notifier.showError(res.error.error.message);
          item.isLoading = false;
        },
      );
  }
}
