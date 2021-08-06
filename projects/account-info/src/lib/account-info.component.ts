import { Component, OnInit, ViewChild } from '@angular/core';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { AccountsListener, IAccountsListener, } from 'real-trading';
import { AccountInfo, AccountInfoRepository, IAccount } from 'trading';
import { convertToColumn, ItemsBuilder, ItemsComponent } from 'base-components';
import { AccountInfoItem } from './models/account-info';
import { NotifierService } from 'notifier';
import { AccountInfoColumnsEnum } from './models/account-info-columns.enum';
import { DataGrid } from "data-grid";

export interface AccountInfoComponent extends ILayoutNode {
}

const headers = [
  {
    name: AccountInfoColumnsEnum.Account,
    title: 'Account',
  },
  {
    name: AccountInfoColumnsEnum.Name,
    title: 'Name',
    style: {
      color: '#fff',
    }
  },
  {
    name: AccountInfoColumnsEnum.Currency,
    title: 'Currency',
  },
  {
    name: AccountInfoColumnsEnum.IbId,
    title: 'IB ID'
  },
  {
    name: AccountInfoColumnsEnum.AccountBalance, title: 'Balance', style: {
      color: '#fff',
    }
  },
  {
    name: AccountInfoColumnsEnum.OpenPnl,
    title: 'Open Pnl'
  },
  {
    name: AccountInfoColumnsEnum.ClosedPnl,
    title: 'Open Pnl'
  },
  {
    name: AccountInfoColumnsEnum.LossLimit,
    title: 'Loss Limit',
  },
  AccountInfoColumnsEnum.Position,
  {
    name: AccountInfoColumnsEnum.CashOnHand,
    title: 'Cash On Hand',
  },
  {
    name: AccountInfoColumnsEnum.BuyQty,
    title: 'Buy Quantity',
  },
  {
    name: AccountInfoColumnsEnum.SellQty,
    title: 'Sell Quantity',
  },
  {
    name: AccountInfoColumnsEnum.AutoLiquidateThreshold,
    title: 'Auto Liquidate Threshold',
  },
];

@Component({
  selector: 'lib-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: [
    './account-info.component.scss',
  ]
})
@AccountsListener()
@LayoutNode()
export class AccountInfoComponent extends ItemsComponent<AccountInfo> implements OnInit, IAccountsListener {
  builder = new ItemsBuilder<AccountInfo, AccountInfoItem>();
  columns = headers.map(item => convertToColumn(item, {
    textOverflow: false, textAlign: 'left',
    hoveredBackgroundColor: '#2B2D33',
  }));
  gridStyles = {
    gridHeaderBorderColor: '#24262C',
    gridBorderColor: 'transparent',
    gridBorderWidth: 0,
    rowHeight: 25,
    color: '#D0D0D2',
  };

  @ViewChild('dataGrid', { static: true }) _dataGrid: DataGrid;


  constructor(protected _repository: AccountInfoRepository,
              protected _notifier: NotifierService) {
    super();
    window['accountInfo'] = this;
  }

  ngOnInit(): void {
    this.setTabTitle('Account info');
    this.builder.setParams({
      wrap: (accountInfo) => new AccountInfoItem(accountInfo),
      unwrap: (accountInfoItem) => accountInfoItem.accountInfo,
    });
  }

  handleNodeEvent(name: LayoutNodeEvent) {
    switch (name) {
      case LayoutNodeEvent.Resize:
      case LayoutNodeEvent.Show:
      case LayoutNodeEvent.Open:
      case LayoutNodeEvent.Maximize:
      case LayoutNodeEvent.Restore:
      case LayoutNodeEvent.MakeVisible:
        this._handleResize();
        break;
    }
  }

  private _handleResize() {
    this._dataGrid?.resize();
  }

  handleAccountsConnect(acccounts: IAccount[], connectedAccounts: IAccount[]) {
    this.loadData({ accounts: connectedAccounts });
  }

  handleAccountsDisconnect(acccounts: IAccount[], connectedAccounts: IAccount[]) {
  }


}
