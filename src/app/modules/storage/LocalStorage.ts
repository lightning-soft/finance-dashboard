import { Storage } from './Storage';
import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorage extends Storage{
  getItem(key: string) {
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  setItem(key: string, data: any) {
    window.localStorage.setItem(key, JSON.stringify(data));
  }

  clear() {
    window.localStorage.clear();
  }

  deleteItem(key: string) {
    window.localStorage.removeItem(key);
  }
}
