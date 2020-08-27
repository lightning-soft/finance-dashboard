import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {AccountRepository, IAccount, OrdersRepository} from 'communication';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {AccountConnectComponent} from './account-connect/account-connect.component';
import {ItemsComponent} from 'core';


@UntilDestroy()
@Component({
  selector: 'account-list',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent extends ItemsComponent<IAccount> implements OnDestroy {

  items: IAccount[] = [];
  accounts = [];
  status = 'Open';

  constructor(
    public repository: AccountRepository,
    private modal: NzModalRef,
    private modalService: NzModalService,
  ) {
    super();
    this.config.autoLoadData = {onInit: true};
  }



  ngOnDestroy(): void {
    this.modal.destroy();
  }

  addAccount() {
    this.modalService.create({
      nzTitle: null,
      nzContent: AccountConnectComponent,
      nzCloseIcon: null,
      nzFooter: null,
      nzWidth: 720,
    });
  }
}
