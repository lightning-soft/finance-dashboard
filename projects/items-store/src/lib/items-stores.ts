import { Inject, Injectable } from '@angular/core';
import { ItemsStoreConfig, ItemsStoreConfigToken } from './items-store.config';
import { ItemsStore } from './items-store';

@Injectable()
export class ItemsStores {
  static RepositoryStores: WeakMap<any, any> = new WeakMap();

  constructor(@Inject(ItemsStoreConfigToken) private _config: ItemsStoreConfig) { }

  get(type: string): ItemsStore<any> {
    const repository = this._config[type];

    if (!repository)
      throw new Error(`Invalid repository for ${type}`);

    if (ItemsStores.RepositoryStores.has(repository)) {
      return ItemsStores.RepositoryStores.get(repository);
    }

    const newStore = new ItemsStore(repository) as ItemsStore;
    ItemsStores.RepositoryStores.set(repository, newStore);

    return newStore;
  }
}
