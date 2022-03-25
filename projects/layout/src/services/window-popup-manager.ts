import { Injectable, Injector } from '@angular/core';
import { Storage } from 'storage';
import { ActivatedRoute } from '@angular/router';
import { Workspace, WorkspacesManager, WorkspaceWindow } from 'workspace-manager';
import * as deepmerge from 'deepmerge';
import { isElectron } from '../../../../src/app/is-electron';
import { WindowMessengerService } from 'window-messenger';
import { Id } from 'communication';

const popupStorageKey = 'widget-popup-state';
const subWindowsStorageKey = 'windows-for-restore';

const mainKey = 'mainKey';
const windowResizeKey = 'windowResizeKey';
const windowSettingsKey = 'windowSettingsKey';
const windowCloseEvent = 'closeWindow';
const windowMoveEvent = 'windowMoveEvent';
export const saveCommand = 'saveCommand';
export const highligtCommand = 'highligtCommand';
export const closeCommand = 'closeCommand';

const maxLocationOffset = -2000;

export interface WindowPopupConfig {
  layoutConfig: any;
  hideWindowHeaderInstruments?: boolean;
  enableKeyEvents?: boolean;
}

@Injectable()
export class WindowPopupManager {
  private _state = {};
  windows = [];
  _windowsData = [];
  closingWindow = false;

  hideWindowHeaderInstruments = false;

  constructor(private _storage: Storage,
              private _route: ActivatedRoute,
              private storage: Storage,
              private _windowMessengerService: WindowMessengerService,
              private injector: Injector,
  ) {
    window?.addEventListener('beforeunload', (event) => {
      this.closingWindow = true;
      this.sendSaveCommand();
      if (this.isPopup()) {
        this._windowMessengerService.send(windowCloseEvent, this.getWindowInfo());
      } else {
        this.storage.setItem(windowSettingsKey, this._state);
      }
      this.sendCloseCommand();
      this._saveSubWindowsData();
    });
  }

  init(workspaces: Workspace[]) {
    if (isElectron()) {
      this.initDesktopSubscriptions(workspaces);
    }

    if (this.isMainWindow()) {
      this._restoreWindows();
    }

    this._windowMessengerService.subscribe(windowCloseEvent, ({ windowId, workspaceId, }) => {
      this._onDeleteWindow(windowId, workspaceId);
    });
  }

  private _onDeleteWindow(windowId, workspaceId) {
    delete this._state[hash(windowId, workspaceId)];
  }

  initDesktopSubscriptions(workspaces) {
    let interval;
    window.addEventListener('mouseout', (evt) => {
      if (evt['toElement'] === null && evt.relatedTarget === null) {
        interval = setInterval(() => {
          if (this.isPopup()) {
            this._windowMessengerService.send(windowMoveEvent, {
              windowId: this.windowId,
              workspaceId: this.workspaceId,
              coords: { x: window.screenX, y: window.screenY }
            });
          } else {
            this._state[mainKey].bounds.x = window.screenX;
            this._state[mainKey].bounds.y = window.screenY;
          }
        }, 1000);
      } else {
        clearInterval(interval);
      }
    });

    window.onresize = () => {
      const bounds = {
        width: window.innerWidth,
        height: window.innerHeight,
        x: window.screenX,
        y: window.screenY
      };
      if (this.isPopup()) {
        this._windowMessengerService.send(windowResizeKey, {
          bounds,
          ...this.getWindowInfo(),
        });
      } else {
        this._state[mainKey] = { bounds };
      }
    };

    const state = this.storage.getItem(windowSettingsKey);
    if (!this.isPopup() && state) {
      const workspaceManager = this.injector.get(WorkspacesManager);
      this._state = state;
      const { mainKey: mainState, ...windowsState } = state;
      if (mainState) {
        window.resizeTo(mainState.bounds.width, mainState.bounds.height);
        window.moveTo(mainState.bounds.x, mainState.bounds.y);
      }
      Object.values(windowsState).forEach(({ bounds, windowId, workspaceId }) => {
        const workspace = workspaces.find(item => item.id == workspaceId);
        const window = workspace?.windows.find(item => item.id == windowId);
        if (workspace && window && workspaceManager.getCurrentWindow()?.id != windowId) {
          this.openWindow(workspace, window, bounds);
        } else {
          delete this._state[hash(windowId, workspaceId)];
        }
      });
    }

    this._windowMessengerService.subscribe(windowResizeKey, ({ windowId, workspaceId, bounds }) => {
      this._state[hash(windowId, workspaceId)] = { bounds, windowId, workspaceId };
    });
    this._windowMessengerService.subscribe(windowMoveEvent, ({ windowId, workspaceId, coords }) => {
      const bounds = this._state[hash(windowId, workspaceId)]?.bounds;
      // need to check is user hid window
      if (!bounds || coords.x < maxLocationOffset || coords.y < maxLocationOffset)
        return;

      bounds.x = coords.x;
      bounds.y = coords.y;
    });
  }

  getWindowInfo() {
    return {
      windowId: this.windowId,
      workspaceId: this.workspaceId,
    };
  }

  sendCommandToSubwindows(type, payload) {
    this.windows.forEach(item => item.postMessage(JSON.stringify({
      type,
      payload,
    })));
  }

  onWindowOpened(workspace: Workspace, workspaceWindow: WorkspaceWindow, bounds: { height?: number; width?: number }) {
    this._state[hash(workspaceWindow.id, workspace.id)] = {
      bounds,
      workspaceId: workspace.id,
      windowId: workspaceWindow.id
    };
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

  isMainWindow() {
    return !window.opener;
  }

  get workspaceId() {
    const params = this._route.snapshot.queryParams;
    return params?.workspaceId;
  }

  get windowName() {
    const params = this._route.snapshot.queryParams;
    return params?.windowName;
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

  openWindow(workspace: Workspace, workspaceWindow: WorkspaceWindow, bounds: { height?: number, x?: number, y?: number, width?: number } = {
    width: window.innerWidth,
    height: window.innerHeight
  }) {
    const layoutConfig = workspaceWindow.config;
    const width = bounds.width;
    const height = bounds.height;

    const windowFeatures = new Map(commonFeatures);
    windowFeatures.set('scrollbars', 'yes');
    windowFeatures.set('resizable', 'yes');
    windowFeatures.set('height', `${height}`);
    windowFeatures.set('width', `${width}`);

    if (bounds.x != null)
      windowFeatures.set('left', `${bounds.x}`);
    if (bounds.y != null)
      windowFeatures.set('top', `${bounds.y}`);

    const queryParams = new URLSearchParams();
    queryParams.append('popup', 'true');
    queryParams.append('workspaceId', `${workspace.id}`);
    queryParams.append('windowId', `${workspaceWindow.id}`);
    queryParams.append('windowName', `${workspaceWindow.name}`);

    const config: WindowPopupConfig = { layoutConfig, hideWindowHeaderInstruments: false };
    this.onWindowOpened(workspace, workspaceWindow, bounds);
    this._openPopup(config, queryParams, windowFeatures);
  }

  private _openPopup(config, queryParams: URLSearchParams, features: Map<string, string>, forRestore = false, name = '') {
    const featuresArray = [];
    features.forEach((value, key) => {
      featuresArray.push(`${key}=${value}`);
    });
    this._storage.setItem(popupStorageKey, JSON.stringify(config));
    if (!name) {
      name = `popup-${Date.now()}`;
    }
    const popup = window.open(window.location.href + '?' + queryParams.toString(), name, featuresArray.join(', '));

    // (popup as any).mess = (window as any).mess;
    // popup.close = () => {
    //   console.log('pp close');
    // };

    (popup as any).deps = (window as any).deps;
    (popup as any).accountsListeners = (window as any).accountsListeners;

    this.windows.push(popup);

    if (!forRestore && this.isMainWindow()) {
      this._saveWindowForRestore(popup, config, queryParams.toString(), featuresArray);
    }
    setTimeout(() => {
      if (popup.closed) {
        const windowId = queryParams.get('windowId');
        const workspaceId = queryParams.get('workspaceId');
        this._onDeleteWindow(windowId, workspaceId);
      }
    }, 1500);

    this._observeChangesInWindow(popup);

    return popup;
  }

  private _observeChangesInWindow(popup: Window) {
    popup?.addEventListener('beforeunload', () => {
      if (!this.closingWindow) {
        this.windows = this.windows.filter(w => w.name !== popup.name);
        this._removeWindowForRestore(popup);
      }
    });
  }

  private _appendWindowForRestore(data: any) {
    this._windowsData.push(data);
  }

  private _removeWindowForRestore(popup: Window) {
    this._windowsData = this._windowsData.filter(data => data.name !== popup.name);
  }

  private _saveWindowForRestore(popup: Window, config, queryParams: string, features: string[]) {
    const persistentWindow = {
      name: popup.name,
      config,
      queryParams,
      features,
    };
    this._appendWindowForRestore(persistentWindow);
  }

  private _saveSubWindowsData() {
    const serialized = JSON.stringify(this._windowsData);
    this._storage.setItem(subWindowsStorageKey, serialized);
  }

  private _restoreWindows() {
    try {
      this._windowsData = JSON.parse(this._storage.getItem(subWindowsStorageKey));
      this._storage.deleteItem(subWindowsStorageKey);
      for (const data of this._windowsData) {
        const config = data.config;
        const queryParams = new URLSearchParams(data.queryParams);
        const features = new Map();
        const name = data.name;

        for (const feature of data.features) {
          const [key, value] = feature.split('=');
          features.set(key, value);
        }

        this._openPopup(config, queryParams, features, true, name);
      }
    } catch (error) {
      this._windowsData = [];
    }
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

  isWindowOpened(workspaceId, id: number | string) {
    return !!this._state[hash(id, workspaceId)];
  }

  sendSaveCommand() {
    try {
      const data = JSON.stringify({
        type: saveCommand,
      });
      this.windows.forEach(item => {
        if (!item.closed) {
          item.postMessage(data);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  highlightWindow(id: number | string, windowId: Id) {
    const data = JSON.stringify({
      type: highligtCommand,
      payload: { workspaceId: id, windowId },
    });
    this.windows.forEach(item => {
      if (!item.closed) {
        item.postMessage(data);
      }
    });
  }

  sendCloseCommand() {
    const data = JSON.stringify({
      type: closeCommand,
    });
    this.windows.forEach(item => {
      if (!item.closed) {
        item.close();
        item.postMessage(data);
      }
    });
    for (const key in this._state) {
      if (mainKey !== key)
        delete this._state[key];
    }
  }

  getWindowName() {
    if (this.isPopup())
      return this.windowName;
  }
}

const commonFeatures = new Map([
  ['location', 'no'],
  ['status', 'no'],
  ['toolbar', 'no'],
  ['menubar', 'no']
]);

export function hash(windowId, workspaceId) {
  return `${windowId}.${workspaceId}`;
}
