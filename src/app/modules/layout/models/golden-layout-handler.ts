import { Subject } from 'rxjs';
import { LayoutHandler } from './layout-handler';
const localStorageKey = 'layoutConfig';

export class GoldenLayoutHandler implements LayoutHandler {
  handleCreate = new Subject<string>();

  create(name: string) {
    this.handleCreate.next(name);
  }

  loadConfig() {
    const config = window.localStorage.getItem(localStorageKey);
    return config ? JSON.parse(config) : null;
  }

  save(config: any) {
    if (config)
      window.localStorage.setItem(localStorageKey, JSON.stringify(config));
  }
}
