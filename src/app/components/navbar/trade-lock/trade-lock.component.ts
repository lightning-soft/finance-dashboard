import { Component, OnInit } from '@angular/core';
import { TradeHandler } from './trade-handle';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

type Alert = {
  visible: boolean,
  text: string,
  type: string
};

const lock = {
  visible: true,
  text: 'Trading is locked',
  type: 'lock',
};

const unlock = {
  visible: true,
  text: 'Trading is unlocked',
  type: 'unlock',
};

@Component({
  selector: 'app-trade-lock',
  templateUrl: './trade-lock.component.html',
  styleUrls: ['./trade-lock.component.scss']
})
@UntilDestroy()
export class TradeLockComponent {

  lockIcons: [string, string] = ['lock', 'unlock'];
  unlocked = true;

  private timerId;

  alert: Alert;

  constructor(private tradeHandler: TradeHandler) {
    this.unlocked = this.tradeHandler.tradingEnabled;
    this.tradeHandler.isTradingEnabled$
      .pipe(untilDestroyed(this))
      .subscribe(value => this.unlocked = value);
  }

  handleLock(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    this.tradeHandler.tradingEnabled = !this.unlocked;

    this.alert = this.unlocked ? Object.assign({}, unlock) : Object.assign({}, lock);

    this.timerId = setTimeout(() => {
      this.alert.visible = false;
    }, 1500);
  }

}
