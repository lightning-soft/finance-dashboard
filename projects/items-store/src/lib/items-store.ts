import { Id } from 'communication';
import { BehaviorSubject, Observable } from 'rxjs';
import { GetItemsRepository } from './items-store.config';

export interface IStoreItem {
  loading?: boolean;
  id: Id;
}

export class ItemsStore<T extends IStoreItem = IStoreItem> {
  private static _requests = [];

  private _map = new Map<Id, T>();

  private _onChange = new BehaviorSubject<Map<Id, T>>(this._map);

  get onChange(): Observable<Map<Id, T>> {
    return this._onChange;
  }

  constructor(protected _repository: GetItemsRepository<T>) {

  }

  get(id: Id): T {
    if (!this._map.has(id))
      this.load(id);

    return this._map.get(id);
  }

  load(id: Id) {
    const map = this._map;
    if (id == null || map.get(id)?.loading === true || map.has(id)) return;
    this._startLoadingIfNeed();
    this._map.set(id, { id, loading: true } as T);
  }

  private _triggerChange() {
    this._onChange.next(this._map);
  }

  private _loadItems() {
    const items = Array.from(this._map.values()).filter((value) => value.loading);

    if (!items.length)
      return;

    const ids = items.map((i) => i.id);
    this._repository.getItemsByIds(ids).subscribe(
      (res) => {
        for (const id of ids) {
          this._map.set(id, {
            ...(res.find(i => i.id === id) || { loading: false }),
            id,
          } as T);
        }
        this._triggerChange();
      },
      (error) => {
        console.error(error);
        for (const id of ids) {
          this._map.delete(id);
        }
        this._triggerChange();
      },
    );
  }

  private _startLoadingIfNeed() {
    const requests = ItemsStore._requests;
    requests.push(() => this._loadItems());

    if (requests.length === 1)
      requestAnimationFrame(() => {
        for (const fn of requests) {
          fn();
        }
      });
  }
}
