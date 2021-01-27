import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from 'settings';
import { skip, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TradeHandler {
  isTradingEnabled$ = new BehaviorSubject<boolean>(false);

  constructor(private settingsService: SettingsService) {
    // skip is needed to ignore default value;
    this.settingsService.settings.pipe(skip(1), take(1) ).toPromise()
      .then(item => {
        this.isTradingEnabled$.next(item.tradingEnabled);
      });
  }

  set tradingEnabled(value: boolean) {
    if (value !== this.tradingEnabled) {
      this.settingsService.updateTradingLock( value);
      this.isTradingEnabled$.next(value);
    }
  }

  get tradingEnabled() {
    return this.isTradingEnabled$.value;
  }
}
