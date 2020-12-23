import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Storage } from 'storage';
import { Workspace } from './workspace';

const localStorageKey = 'workspaces';

@Injectable()
export class WorkspacesStore {
  constructor(private storage: Storage) { }

  setItems(data: any): Observable<void> {
    return of(this.storage.setItem(localStorageKey, data));
  }

  getItems(): Observable<Workspace[]> {
    let items: Workspace[] = this.storage.getItem(localStorageKey);
    return of(items);
  }

  deleteItem(id: any): Observable<void> {
    const items: any[] = this.storage.getItem(localStorageKey);
    return of(this.storage.setItem(localStorageKey, items.filter(i => i.id !== id)));
  }

  setItemConfig(configId: any, data: any): Observable<void> {
    return of(this.storage.setItem(configId, data));
  }

  getItemConfig(configId: any): Observable<any[]> {
    return of(this.storage.getItem(configId));
  }
  
  deleteItemConfig(configId: any): Observable<void> {
    return of(this.storage.deleteItem(configId));
  }

}
