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

  openWidget(widget) {
    const options = widget.layoutContainer.options;
    const name = widget.layoutContainer.type;
    options.x = 0;
    options.y = 0;
    const { height, width } = options;
    let state;
    if (widget.saveState)
      state = widget.saveState();
    options.component = { name, state };
    const widgetFeatures = new Map(commonFeatures);
    widgetFeatures.set('scrollbars', 'no');
    widgetFeatures.set('resizable', 'no');
    widgetFeatures.set('innerHeight', `${height}`);
    widgetFeatures.set('innerWidth', `${width}`);

    const config: WindowPopupConfig = { layoutConfig: [options], hideWindowHeaderInstruments: true };
    this._openPopup(config, widgetFeatures);
  }

  openWindow(workspaceWindow: WorkspaceWindow) {
    const layoutConfig = workspaceWindow.config;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const windowFeatures = new Map(commonFeatures);
    windowFeatures.set('scrollbars', 'yes');
    windowFeatures.set('resizable', 'yes');
    windowFeatures.set('height', `${height}`);
    windowFeatures.set('width', `${width}`);

    const config: WindowPopupConfig = { layoutConfig, hideWindowHeaderInstruments: false };
    this._openPopup(config, windowFeatures);
  }

  private _openPopup(config, features: Map<string, string>) {
    const featuresArray = [];
    features.forEach((value, key) => {
      featuresArray.push(`${key}=${value}`);
    });
    this._storage.setItem(popupStorageKey, JSON.stringify(config));
    window.open(window.location.href + '?popup', '_blank', featuresArray.join(', '));
  }

  getConfig(): WindowPopupConfig {
    const stringState = this._storage.getItem(popupStorageKey);
    if (stringState) {
      try {
        return JSON.parse(stringState);
      } catch (e) {
        console.error(e);
      }
    }
  }

  deleteConfig() {
    this._storage.deleteItem(popupStorageKey);
  }
}

const commonFeatures = new Map([
  ['location', 'no'],
  ['status', 'no'],
  ['toolbar', 'no'],
  ['menubar', 'no']
]);


