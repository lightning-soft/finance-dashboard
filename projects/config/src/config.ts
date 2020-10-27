import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class Config {
  protected _$config = new ReplaySubject<this>(1);

  apply(config: any) {
    console.log('config', JSON.stringify(config));
    Object.assign(this, config);
    this._$config.next(this);
  }

  getConfig(): Observable<this> {
    return this._$config.pipe(filter(Boolean)) as Observable<this>;
  }
}
