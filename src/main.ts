import { enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then((ref: NgModuleRef<AppModule>) => {
    if ((window as any).handleApp)
      (window as any).handleApp(ref.instance);
  })
  .catch(err => console.error(err));
