import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LayoutHandler } from './layout-handler';

const localStorageKey = 'layoutConfig';

@Injectable()
export class GoldenLayoutHandler implements LayoutHandler {
  handleCreate = new Subject<string>();

  create(name: string) {
    this.handleCreate.next(name);
  }
}
