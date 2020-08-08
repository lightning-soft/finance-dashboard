import {Subject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoldenLayoutHandler {
 static layoutItems = ['Chart', 'Watch', 'Orders'];

  handleCreate = new Subject<string>();

  create(name: string) {
    this.handleCreate.next(name);
  }
}
