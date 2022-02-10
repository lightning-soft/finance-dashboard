import { ModuleWithProviders, NgModule, Injector } from '@angular/core';
import { ItemsStoreConfig, ItemsStoreConfigToken } from './items-store.config';
import { ItemsStores } from './items-stores';


@NgModule({
  declarations: [],
})
export class ItemsStoreModule {
  static forRoot(config: (injector: Injector) => ItemsStoreConfig): ModuleWithProviders<ItemsStoreModule> {
    return {
      ngModule: ItemsStoreModule,
      providers: [
        ItemsStores,
        {
          provide: ItemsStoreConfigToken,
          useFactory: config,
          deps: [Injector],
        }
      ]
    };
  }
}
