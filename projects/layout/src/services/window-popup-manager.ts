import { Injectable } from '@angular/core';
import { Storage } from 'storage';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceWindow } from 'workspace-manager';

const popupStorageKey = 'widget-popup-state';

export interface WindowPopupConfig {
  layoutConfig: any;
  hideWindowHeaderInstruments?: boolean;
}

@Injectable()
export class WindowPopupManager {

  hideWindowHeaderInstruments = false;

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
    const config: WindowPopupConfig = { layoutConfig: [options], hideWindowHeaderInstruments: true };
    this._storage.setItem(popupStorageKey, JSON.stringify(config));
    window.open(window.location.href + '?popup', '_blank', `location=no, innerHeight=${height}, innerWidth=${width}, scrollbars=no, status=no, toolbar=no, menubar=no, resizable=no`);
  }

  openWindow(workspaceWindow: WorkspaceWindow) {
    const layoutConfig = workspaceWindow.config;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const config: WindowPopupConfig = { layoutConfig, hideWindowHeaderInstruments: false };
    this._storage.setItem(popupStorageKey, JSON.stringify(config));
    window.open(window.location.href + '?popup', '_blank', `location=no, height=${height}, width=${width}, scrollbars=yes, status=no, toolbar=no, menubar=no, resizable=yes`);
  }

  getConfig(): WindowPopupConfig {
    const stringState = this._storage.getItem(popupStorageKey);
    try {
      if (stringState)
        return JSON.parse(stringState);
    } catch (e) {
      console.error(e);
    }
  }

  deleteConfig() {
    this._storage.deleteItem(popupStorageKey);
  }
}
