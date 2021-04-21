import { Injectable } from '@angular/core';
import { Storage } from 'storage';
import { ActivatedRoute } from '@angular/router';
import { Workspace, WorkspaceWindow } from 'workspace-manager';
import * as deepmerge from 'deepmerge';

const popupStorageKey = 'widget-popup-state';

export interface WindowPopupConfig {
  layoutConfig: any;
  hideWindowHeaderInstruments?: boolean;
  enableKeyEvents?: boolean;
}

@Injectable()
export class WindowPopupManager {

  hideWindowHeaderInstruments = false;

  constructor(private _storage: Storage,
              private _route: ActivatedRoute,
  ) {
  }

  shouldShowToolbar() {
    return this.isWindowPopup() || !this.isPopup();
  }

  isPopup() {
    const params = this._route.snapshot.queryParams;
    return params && params.hasOwnProperty('popup');
  }

  isWindowPopup() {
    const params = this._route.snapshot.queryParams;
    return params && params.hasOwnProperty('workspaceId') && params.hasOwnProperty('windowId');
  }

  get workspaceId() {
    const params = this._route.snapshot.queryParams;
    return params?.workspaceId;
  }

  get windowId() {
    const params = this._route.snapshot.queryParams;
    return params?.windowId;
  }

  getSaveConfigs() {
    return {
      windowId: this.windowId,
      workspaceId: this.workspaceId,
    };
  }

  openWidget(widget) {
    const options: any = deepmerge({}, widget.layoutContainer.options);
    const name = widget.layoutContainer.type;
    options.x = 0;
    options.y = 0;
    const { height, width } = options;
    options.height = options.minHeight;
    options.width = options.minWidth;
    let state;
    if (widget.saveState)
      state = widget.saveState();
    options.component = { name, state };
    const widgetFeatures = new Map(commonFeatures);
    widgetFeatures.set('scrollbars', 'yes');
    widgetFeatures.set('resizable', 'yes');
    widgetFeatures.set('innerHeight', `${height}`);
    widgetFeatures.set('innerWidth', `${width}`);
    const queryParams = new URLSearchParams();
    queryParams.append('popup', 'true');
    widget.close();
    const config: WindowPopupConfig = { layoutConfig: [options], hideWindowHeaderInstruments: true };
    let subwindow = this._openPopup(config, queryParams, widgetFeatures);
    if (subwindow) {
      subwindow.onbeforeunload = (e) => {
        if (widget.saveState)
          state = widget.saveState();
        widget.layoutContainer.options.component = { name, state };
        widget.layout.addComponent(widget.layoutContainer.options);
        subwindow.onbeforeunload = null;
        subwindow = null;
      };
    }
  }

  openWindow(workspace: Workspace, workspaceWindow: WorkspaceWindow) {
    const layoutConfig = workspaceWindow.config;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const windowFeatures = new Map(commonFeatures);
    windowFeatures.set('scrollbars', 'yes');
    windowFeatures.set('resizable', 'yes');
    windowFeatures.set('height', `${height}`);
    windowFeatures.set('width', `${width}`);

    const queryParams = new URLSearchParams();
    queryParams.append('popup', 'true');
    queryParams.append('workspaceId', `${workspace.id}`);
    queryParams.append('windowId', `${workspaceWindow.id}`);

    const config: WindowPopupConfig = { layoutConfig, hideWindowHeaderInstruments: false };
    this._openPopup(config, queryParams, windowFeatures);
  }

  private _openPopup(config, queryParams: URLSearchParams, features: Map<string, string>) {
    const featuresArray = [];
    features.forEach((value, key) => {
      featuresArray.push(`${key}=${value}`);
    });
    this._storage.setItem(popupStorageKey, JSON.stringify(config));
    console.warn(queryParams.toString());
    return window.open(window.location.origin + '?' + queryParams.toString(), '_blank', featuresArray.join(', '));
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


