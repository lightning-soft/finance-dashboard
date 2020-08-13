import { enableProdMode, NgModuleRef, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .then((ref: NgModuleRef<AppModule>) => {
      // disable ng zone for jQuery handlers (StockChartX optimization)
      const zone = ref.injector.get(NgZone);
      const on = jQuery.prototype.on;
      jQuery.prototype.on = function (...args) {
        const _this = this;
        return zone.runOutsideAngular(() => {
          return on.apply(_this, args);
        })
      }
    })
    .catch(err => console.error(err));
});
