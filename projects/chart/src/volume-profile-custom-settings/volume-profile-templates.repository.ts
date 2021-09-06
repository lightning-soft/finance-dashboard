import { Inject, Injectable, OnDestroy, Injector } from '@angular/core';
import { FakeRepository } from 'communication';
import { Observable, of, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SettingsService } from 'settings';

export interface IVolumeTemplate {
  id: string;
  name: string;
  settings: any;
}

const STORE_KEY = 'volumeProfileTemplates';
const DefaultTemplates = [
  { id: 'buyVolProf', name: 'BuyVolProf', settings: {} },
  { id: 'sellVolProf', name: 'SellVolProf', settings: {} }
];

@Injectable({ providedIn: 'root' })
export class VolumeProfileTemplatesRepository extends FakeRepository<IVolumeTemplate> implements OnDestroy {
  private _subscriptions: Subscription;

  constructor(private _settingsService: SettingsService) {
    super();
    this._subscriptions = this.actions.subscribe(() => this._save());
  }

  protected async _init() {
    setTimeout(() => { super._init(); });
  }

  private _getTemplates(): Observable<IVolumeTemplate[]> {
    const keys = Object.keys(this._store);
    if (keys.length > 0) {
      const items: IVolumeTemplate[] = [];
      for (const key of keys) {
        if (this.store.hasOwnProperty(key)) {
          items.push(this.store[key]);
        }
      }

      return of(items);
    } else {
      return this._settingsService.get(STORE_KEY).
        pipe(mergeMap((items: IVolumeTemplate[]) => {
          if (!Array.isArray(items) || !items.length) {
            items = DefaultTemplates;
          }

          this._store = {};
          for (const item of items) {
            this._store[item.id] = item;
          }

          return of(items);
        }),
        );
    }
  }

  private _save() {
    this._getTemplates()
      .pipe(mergeMap(items => this._settingsService.set(STORE_KEY, items)))
      .subscribe(
        items => console.log('Templates successfully saved'),
        err => console.error('Templates saved error', err)
      );
  }

  async _getItems() {
    return this._getTemplates().toPromise();
  }

  ngOnDestroy(): void {
    if (!this._subscriptions)
      return;

    this._subscriptions.unsubscribe();
    this._subscriptions = null;
  }
}
