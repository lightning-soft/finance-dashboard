import {Subject} from 'rxjs';

export class LayoutService {
  onStateChange$ = new Subject();

  onStateChange() {
    this.onStateChange$.next();
  }
}
