import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {AccountRepository, OrdersRepository} from 'communication';


@UntilDestroy()
@Component({
  selector: 'account-list',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {


  items: any[] = [];
  accounts = [];
  status = 'Open';

  constructor(
    private repository: AccountRepository,
  ) {
  }


  ngOnInit(): void {


  }


  ngOnDestroy(): void {
  }

}
