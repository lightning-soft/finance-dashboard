import { Injectable } from '@angular/core';
import { Storage } from 'storage';
import { ActivatedRoute } from '@angular/router';

const popupStorageKey = 'widget-popup-state';

@Injectable()
export class WindowPopupManager {
  constructor(private _storage: Storage,
              private _route: ActivatedRoute,
  ) {
  }

  isPopup() {
    const params = this._route.snapshot.queryParams;
    return params && params.hasOwnProperty('popup');
  }

  openPopup(widget) {
    const options = widget.layoutContainer.options;
    const name = widget.layoutContainer.type;
    options.x = 0;
    options.y = 0;
    const { height, width } = options;
    let state;
    if (widget.saveState)
      state = widget.saveState();
    options.component = { name, state };
    this._storage.setItem(popupStorageKey, JSON.stringify(options));
    window.open(window.location.href + '?popup', '_blank', `location=no, height=${ height }, width=${ width }, scrollbars=no, status=no, toolbar=no, menubar=no, resizable=no`);
  }

  getOptions() {
    const stringState = this._storage.getItem(popupStorageKey);
    if (stringState)
      return JSON.parse(stringState);
  }

  deleteConfig() {
    this._storage.deleteItem(popupStorageKey);
  }
}
