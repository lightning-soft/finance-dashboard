import { Column, DataCell, HoverableItem, NumberCell } from 'data-grid';
import { AccountInfo } from 'trading';
import { Id } from 'communication';
import { accountInfoColumnsArray, AccountInfoColumnsEnum } from './account-info-columns.enum';

const accountInfoProps = [AccountInfoColumnsEnum.AccountBalance, AccountInfoColumnsEnum.ClosedPnl, AccountInfoColumnsEnum.OpenPnl,
  AccountInfoColumnsEnum.CashOnHand, AccountInfoColumnsEnum.Position,
  AccountInfoColumnsEnum.BuyQty, AccountInfoColumnsEnum.SellQty, AccountInfoColumnsEnum.Name, AccountInfoColumnsEnum.Currency,
  AccountInfoColumnsEnum.fcmId, AccountInfoColumnsEnum.IbId, AccountInfoColumnsEnum.LossLimit,
  AccountInfoColumnsEnum.AutoLiquidateThreshold];

export class AccountInfoItem extends HoverableItem {
  id: Id;

  accountBalance: NumberCell = new NumberCell({ withHoverStatus: true, hightlightOnChange: false });
  closedPnl: NumberCell = new NumberCell({ withHoverStatus: true,  hightlightOnChange: false });
  openPnl: NumberCell = new NumberCell({ withHoverStatus: true,  hightlightOnChange: false });
  cashOnHand = new NumberCell({ withHoverStatus: true,  hightlightOnChange: false });
  position = new NumberCell({ withHoverStatus: true,  hightlightOnChange: false });
  buyQty = new NumberCell({ withHoverStatus: true,  hightlightOnChange: false });
  sellQty = new NumberCell({ withHoverStatus: true,  hightlightOnChange: false });
  account = new DataCell({ withHoverStatus: true });
  name = new DataCell({ withHoverStatus: true });
  currency = new DataCell({ withHoverStatus: true });
  fcmId = new DataCell({ withHoverStatus: true });
  ibId = new DataCell({ withHoverStatus: true });
  lossLimit = new NumberCell({ withHoverStatus: true,  hightlightOnChange: false });
  autoLiquidateThreshold = new NumberCell({ withHoverStatus: true,  hightlightOnChange: false });

  constructor(public accountInfo?: AccountInfo) {
    super();
    if (accountInfo)
      this.update(accountInfo);
  }

  update(accountInfo: AccountInfo) {
    accountInfoProps.forEach((item: string) => {
      this[item].updateValue(accountInfo[item]);
    });
    this.account.updateValue(accountInfo.id);
    this.id = accountInfo.id;
  }

  protected _getPropertiesForHover(column: Column): string[] {
    return accountInfoColumnsArray;
  }
}
