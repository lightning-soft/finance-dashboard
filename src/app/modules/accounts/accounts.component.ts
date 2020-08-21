import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {AccountRepository, IAccount, OrdersRepository} from 'communication';
import {NzModalRef} from 'ng-zorro-antd/modal';


@UntilDestroy()
@Component({
  selector: 'account-list',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit, OnDestroy {

  items: IAccount[] = [];
  accounts = [];
  status = 'Open';

  constructor(
    private repository: AccountRepository,
    private modal: NzModalRef
  ) {

  }


  ngOnInit(): void {
    this.repository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe((accounts) => {
        this.items = accounts;
      });

  }


  ngOnDestroy(): void {
    this.modal.destroy();
  }

}
