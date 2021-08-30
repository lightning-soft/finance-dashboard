import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SettingsService } from 'settings';
import { skip, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TradeHandler {
  isTradingEnabled$ = new BehaviorSubject<boolean>(true);
  tradingNotifier$ = new Subject<boolean>();

  get tradingEnabled() {
    return this.isTradingEnabled$.value;
  }

  constructor(private settingsService: SettingsService) {
    // skip is needed to ignore default value;
    this.settingsService.settings
      .pipe(skip(1), take(1))
      .subscribe(settings => this.isTradingEnabled$.next(settings.tradingEnabled));
  }

  toggleTradingEnabled(): void {
    this._setEnabledState(!this.tradingEnabled);
  }

  enableTrading(): void {
    this._setEnabledState(true);
  }

  disableTrading(): void {
    this._setEnabledState(false);
  }

  showDisableTradingAlert() {
    this.tradingNotifier$.next(false);
  }

  private _setEnabledState(enabled: boolean): void {
    if (enabled !== this.tradingEnabled)
      this.settingsService.updateTradingLock(enabled);

    this.isTradingEnabled$.next(enabled);
  }
}
