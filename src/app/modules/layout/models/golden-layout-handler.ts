import { Subject } from 'rxjs';
import { LayoutHandler } from './layout-handler';
import { Injectable } from '@angular/core';

@Injectable()
export class GoldenLayoutHandler implements LayoutHandler {
  handleCreate = new Subject<string>();

  create(name: string) {
    this.handleCreate.next(name);
  }
}
