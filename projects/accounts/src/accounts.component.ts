import { Component, OnDestroy } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ItemsComponent } from 'base-components';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AccountRepository, IAccount } from 'trading';
import { AccountConnectComponent } from './account-connect/account-connect.component';

@UntilDestroy()
@Component({
  selector: 'account-list',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent extends ItemsComponent<IAccount> implements OnDestroy {

  accounts = [];
  status = 'Open';

  constructor(
    public _repository: AccountRepository,
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
