import { Inject, Injectable, Optional, Component, Injector, InjectFlags, SkipSelf } from '@angular/core';
import { IconComponent, iconComponentSelector, PriceComponent, priceComponentSelector } from "../models";

export abstract class IViewBuilderStore {
  abstract getComponent(component: any);
}
export abstract class IViewBuilderStoreConfig {
  [key: string]: typeof Component;
}

const store = {
  [iconComponentSelector]: IconComponent,
  [priceComponentSelector]: PriceComponent,
}

@Injectable()
export class ViewBuilderStore implements IViewBuilderStore {

  constructor(@Inject(IViewBuilderStore) @Optional() @SkipSelf() private _viewBuilderStore: IViewBuilderStore | IViewBuilderStoreConfig) {
    if (!_viewBuilderStore)
      return;

    if (!_viewBuilderStore.getComponent) {
      const store = this._viewBuilderStore;
      this._viewBuilderStore = new class extends IViewBuilderStore {
        getComponent(component) {
          return store[component];
        }
      };
    }
  }

  getComponent(name: string) {
    const item = this._viewBuilderStore && (this._viewBuilderStore as IViewBuilderStore).getComponent(name);

    return item || store[name];
  }
}
