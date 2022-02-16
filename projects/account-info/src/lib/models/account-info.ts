import { Column, DataCell, HoverableItem, NumberCell, RoundFormatter } from 'data-grid';
import { AccountInfo } from 'trading';
import { Id } from 'communication';
import { accountInfoColumnsArray, AccountInfoColumnsEnum } from './account-info-columns.enum';

const accountInfoProps = [AccountInfoColumnsEnum.AccountBalance, AccountInfoColumnsEnum.ClosedPnl, AccountInfoColumnsEnum.OpenPnl,
  AccountInfoColumnsEnum.CashOnHand, AccountInfoColumnsEnum.Position,
  AccountInfoColumnsEnum.BuyQty, AccountInfoColumnsEnum.SellQty, AccountInfoColumnsEnum.Name, AccountInfoColumnsEnum.Currency,
  AccountInfoColumnsEnum.fcmId, AccountInfoColumnsEnum.IbId, AccountInfoColumnsEnum.LossLimit,
  AccountInfoColumnsEnum.AutoLiquidateThreshold];

class AccountBalanceCell extends NumberCell {
  updateValue(value) {
    if (value == null) {
      super.updateValue(0);
      return true;
    }

    return super.updateValue(value);
  }
}

export class AccountInfoItem extends HoverableItem {
  id: Id;

  private _formatter = new RoundFormatter(2);

  accountBalance: NumberCell = new AccountBalanceCell({
    withHoverStatus: true, hightlightOnChange: false,
    formatter: this._formatter,
    ignoreZero: false,
  });
  closedPnl: NumberCell = new NumberCell({
    withHoverStatus: true,
    hightlightOnChange: false,
    formatter: this._formatter
  });
  openPnl: NumberCell = new NumberCell({
    withHoverStatus: true, hightlightOnChange: false,
    formatter: this._formatter
  });
  cashOnHand = new NumberCell({
    withHoverStatus: true, hightlightOnChange: false,
    formatter: this._formatter
  });
  position = new NumberCell({ withHoverStatus: true, hightlightOnChange: false });
  buyQty = new NumberCell({ withHoverStatus: true, hightlightOnChange: false });
  sellQty = new NumberCell({ withHoverStatus: true, hightlightOnChange: false });
  account = new DataCell({ withHoverStatus: true });
  name = new DataCell({ withHoverStatus: true });
  currency = new DataCell({ withHoverStatus: true });
  fcmId = new DataCell({ withHoverStatus: true });
  ibId = new DataCell({ withHoverStatus: true });
  lossLimit = new NumberCell({ withHoverStatus: true, hightlightOnChange: false });
  autoLiquidateThreshold = new NumberCell({ withHoverStatus: true, hightlightOnChange: false });

  unavalableCell = new DataCell({ withHoverStatus: true });
  availableBuingPower = this.unavalableCell;
  reservedBuingPower = this.unavalableCell;
  usedBuingPower = this.unavalableCell;
  impliedMarginReserved = this.unavalableCell;
  marginBalance = this.unavalableCell;
  reservedMargin = this.unavalableCell;

  constructor(public accountInfo?: AccountInfo) {
    super();
    if (accountInfo)
      this.update(accountInfo);

    this.unavalableCell.updateValue('Not supported On Rithmic');
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
