export abstract class IViewBuilderStore {
  abstract getComponent(component: any);
}

export class ViewBuilderStore implements IViewBuilderStore {

  constructor(private _store: { [key: string]: any }) {
    if (!_store)
      throw new Error('Please init store');
  }

  getComponent(component: string) {
    return this._store && this._store[component];
  }
}
