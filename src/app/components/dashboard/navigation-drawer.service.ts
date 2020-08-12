import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable()
export class NavigationDrawerService {

  isOpen$ = new BehaviorSubject<boolean>(false);

  open() {
    this.isOpen$.next(true);
  }

  close() {
    this.isOpen$.next(false);
  }

  toggle() {
    this.isOpen$.next(!this.isOpen$.value);
  }
}
