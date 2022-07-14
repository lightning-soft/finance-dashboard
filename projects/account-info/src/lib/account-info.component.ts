import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { ConnectionsListener, IConnectionsListener } from 'real-trading';
import { AccountInfo, AccountInfoRepository, IConnection, IPosition, PositionsFeed } from 'trading';
import { convertToColumn, ItemsBuilder, ItemsComponent } from 'base-components';
import { AccountInfoItem } from './models/account-info';
import { NotifierService } from 'notifier';
import { AccountInfoColumnsEnum } from './models/account-info-columns.enum';
import { DataGrid } from 'data-grid';
import { Storage } from 'storage';
import { Components } from 'src/app/modules';
import { IPresets, LayoutPresets, TemplatesService } from 'templates';
import { IAccountInfoPresets, IAccountInfoState } from '../models';
import { NzModalService } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, filter } from 'rxjs/operators';
import { WindowManagerService } from 'window-manager';
import { IPaginationResponse } from 'communication';

export interface AccountInfoComponent extends ILayoutNode, IPresets<IAccountInfoState> {
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
    title: 'Open Pl'
  },
  {
    name: AccountInfoColumnsEnum.ClosedPnl,
    title: 'Сlosed Pl',
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
const rowHeight = 25;
const windowHeaderHeight = 22;
const minWindowHeight = 72;
const yPadding = 2;

@Component({
  selector: 'account-info',
  templateUrl: './account-info.component.html',
  styleUrls: [
    './account-info.component.scss',
  ]
})
@ConnectionsListener()
@LayoutNode()
@LayoutPresets()
export class AccountInfoComponent extends ItemsComponent<AccountInfo> implements OnInit, IConnectionsListener, AfterViewInit, OnDestroy {
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
    rowHeight,
    color: '#D0D0D2',
  };

  $loadData = new Subject<IConnection[]>();

  @ViewChild('dataGrid', { static: true }) _dataGrid: DataGrid;

  Components = Components;

  private _accountMap = {};
  _unsubscribeFn;


  constructor(protected _repository: AccountInfoRepository,
              private _storage: Storage,
              public readonly _notifier: NotifierService,
              public readonly _templatesService: TemplatesService,
              private _windowManagerService: WindowManagerService,
              private _positionFeed: PositionsFeed,
              public readonly _modalService: NzModalService) {
    super();
    this.$loadData
      .pipe(
        debounceTime(10),
        filter((connections) => !!connections.length),
        untilDestroyed(this)
      ).subscribe((connections) => {
      this.loadData({ connections });
    });
  }

  ngOnInit(): void {
    this.setTabTitle('Account info');
    this.setTabIcon('icon-account-info');
    this.builder.setParams({
      wrap: (accountInfo) => new AccountInfoItem(accountInfo),
      unwrap: (accountInfoItem) => accountInfoItem.accountInfo,
    });
    this._unsubscribeFn = this._positionFeed.on((position: IPosition) => {
      const account = this._accountMap[position.account.id];
      if (account && position.accountBalance !== 0)
        account.accountBalance.updateValue(position.accountBalance);
    });
  }

  ngAfterViewInit() {
    this.validateComponentHeight();
  }

  saveState() {
    return this._dataGrid.saveState();
  }

  loadState(state: IAccountInfoState) {
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

  save(): void {
    const presets: IAccountInfoPresets = {
      id: this.loadedPresets?.id,
      name: this.loadedPresets?.name,
      type: Components.AccountInfo
    };

    this.savePresets(presets);
  }

  private _handleResize() {
    this._dataGrid?.resize();
  }

  validateComponentHeight(): void {
    if (!this._dataGrid || !this._dataGrid.isInitialized)
      return;

    const height = yPadding + windowHeaderHeight + (this.builder.items.length +
      (this._dataGrid.contextMenuState.showColumnHeaders ? 1 : 0)) * rowHeight;
    const window = this._windowManagerService.getWindowByComponent(this);
    if (!window)
      return;

    window.options.minHeight = Math.max(height, minWindowHeight);
    if (window.height < window.options.minHeight) {
      window.height = window.options.minHeight;
      this._handleResize();
    }
  }

  ngOnDestroy() {
    if (this._unsubscribeFn)
      this._unsubscribeFn();
  }

  protected _handleResponse(response: IPaginationResponse<AccountInfo>, params: any = {}) {
    super._handleResponse(response, params);
    this.validateComponentHeight();
    this._updateAccountMap();
  }

  private _updateAccountMap() {
    this._accountMap = {};
    for (const account of this.builder.items) {
      this._accountMap[account.accountInfo.id] = account;
    }
  }

  handleConnectionsConnect(connections: IConnection[], connectedConnections: IConnection[]) {
    this.$loadData.next(connectedConnections);
  }

  handleDefaultConnectionChanged() {
  }

  handleConnectionsDisconnect(connections: IConnection[], connectedConnections: IConnection[]) {
    this.builder.removeWhere(item => !connectedConnections.some(acc => acc.id == item.accountInfo.connectionId));
    this.validateComponentHeight();
    this._updateAccountMap();
  }

}
