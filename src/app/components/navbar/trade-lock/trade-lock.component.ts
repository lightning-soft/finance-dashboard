import { Component } from '@angular/core';
import { TradeHandler } from './trade-handle';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { skip } from 'rxjs/operators';

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
      .pipe(
        untilDestroyed(this))
      .subscribe(enabled => {
        this.unlocked = enabled;
      });
    this.tradeHandler.isTradingEnabled$.pipe(
      skip(2),
      untilDestroyed(this),
    ).subscribe(() => {
      this.showAlert(this.unlocked);
    });
    this.tradeHandler.tradingNotifier$
      .pipe(untilDestroyed(this))
      .subscribe((value: boolean) => {
        this.showAlert(value);
      });
  }

  showAlert(unlocked: boolean) {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.alert = unlocked ? Object.assign({}, unlock) : Object.assign({}, lock);
    this.timerId = setTimeout(() => this.alert.visible = false, 1500);
  }

  toggleTrading(): void {
    this.tradeHandler.toggleTradingEnabled();
  }
}
