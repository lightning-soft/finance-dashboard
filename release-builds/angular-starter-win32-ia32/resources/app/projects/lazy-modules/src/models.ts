import { Type } from '@angular/core';

export interface ComponentStore {
  [key: string]: Type<any>;
}

export interface LazyModule {
  readonly components: ComponentStore;
}

export interface IModules {
  module: string;
  components: string[];
}