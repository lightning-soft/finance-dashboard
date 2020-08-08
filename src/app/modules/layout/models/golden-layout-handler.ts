import { Subject } from 'rxjs';
import { LayoutHandler } from './layout-handler';

export class GoldenLayoutHandler implements LayoutHandler {
  handleCreate = new Subject<string>();

  create(name: string) {
    this.handleCreate.next(name);
  }
}
