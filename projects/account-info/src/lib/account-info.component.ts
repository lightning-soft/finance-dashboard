import { Component, OnInit, ViewChild } from '@angular/core';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { AccountsListener, IAccountsListener, } from 'real-trading';
import { AccountInfo, AccountInfoRepository, IAccount } from 'trading';
import { convertToColumn, ItemsBuilder, ItemsComponent } from 'base-components';
import { AccountInfoItem } from './models/account-info';
import { NotifierService } from 'notifier';
import { AccountInfoColumnsEnum } from './models/account-info-columns.enum';
import { DataGrid } from 'data-grid';
import { Storage } from 'storage';
import { accountInfoSizeKey } from 'src/app/components';

export interface AccountInfoComponent extends ILayoutNode {
}

const headers = [
  {
    name: AccountInfoColumnsEnum.Account,
    title: 'Account',
    canHide: false,
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
    name: AccountInfoColumnsEnum.fcmId,
    title: 'FCM ID'
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
    name: AccountInfoColumnsEnum.availableBuingPower,
    title: 'Available Buing Power'
  },
  {
    name: AccountInfoColumnsEnum.usedBuingPower,
    title: 'Used Buing Power'
  },
  {
    name: AccountInfoColumnsEnum.fcmId,
    title: 'Reserved Buing Power'
  },
  {
    name: AccountInfoColumnsEnum.OpenPnl,
    title: 'Open Pnl'
  },
  {
    name: AccountInfoColumnsEnum.ClosedPnl,
    title: 'Сlosed Pnl',
  },
  {
    name: AccountInfoColumnsEnum.LossLimit,
    title: 'Loss Limit',
  },
  { name: AccountInfoColumnsEnum.Position, title: 'Position' },
  /*  {
      name: AccountInfoColumnsEnum.workingBuys,
      title: 'Working Buys'
    },
    {
      name: AccountInfoColumnsEnum.workingSell,
      title: 'Working Sell'
    },*/
  {
    name: AccountInfoColumnsEnum.CashOnHand,
    title: 'Cash On Hand',
  },
  {
    name: AccountInfoColumnsEnum.impliedMarginReserved,
    title: 'Implied Margin Reserved'
  },
  {
    name: AccountInfoColumnsEnum.marginBalance,
    title: 'Margin Balance'
  },
  {
    name: AccountInfoColumnsEnum.reservedMargin,
    title: 'Reserved Margin'
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
  selector: 'account-info',
  templateUrl: './account-info.component.html',
  styleUrls: [
    './account-info.component.scss',
  ]
})
@AccountsListener()
@LayoutNode()
export class AccountInfoComponent extends ItemsComponent<AccountInfo> implements OnInit, IAccountsListener {
  builder = new ItemsBuilder<AccountInfo, AccountInfoItem>();
  contextMenuState = {
    showColumnHeaders: true,
    showHeaderPanel: true,
  };
  columns = headers.map(item => convertToColumn(item, {
    textOverflow: false, textAlign: 'left',
    hoveredBackgroundColor: '#2B2D33',
    titleUpperCase: false
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
              private _storage: Storage,
              protected _notifier: NotifierService) {
    super();
  }

  ngOnInit(): void {
    this.setTabTitle('Account info');
    this.setTabIcon('icon-account-info');
    this.builder.setParams({
      wrap: (accountInfo) => new AccountInfoItem(accountInfo),
      unwrap: (accountInfoItem) => accountInfoItem.accountInfo,
    });
    this.onRemove(() => {
      const { x, y, height, width } = this.layoutContainer.options;
      this._storage.setItem(accountInfoSizeKey, { layoutConfig: { height, width, x, y }, state: this.saveState() });
    });
    const data = this._storage.getItem(accountInfoSizeKey);
    this.loadState(data?.state);
    if (data?.layoutConfig) {
      this.layoutContainer.height = data?.layoutConfig.height;
      this.layoutContainer.width = data?.layoutConfig.width;
      this.layoutContainer.x = data.layoutConfig.x;
      this.layoutContainer.y = data.layoutConfig.y;
    }
  }

  saveState() {
    return this._dataGrid.saveState();
  }

  loadState(state) {
    if (state?.columns) {
      this.columns = state.columns;
    }
    if (state?.contextMenuState) {
      this.contextMenuState = state.contextMenuState;
    }
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
