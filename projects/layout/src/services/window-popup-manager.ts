import { Injectable, Injector } from '@angular/core';
import { Storage } from 'storage';
import { ActivatedRoute } from '@angular/router';
import { Workspace, WorkspacesManager, WorkspaceWindow } from 'workspace-manager';
import * as deepmerge from 'deepmerge';
import { isElectron } from '../../../../src/app/is-electron';
import { WindowMessengerService } from 'window-messenger';

const popupStorageKey = 'widget-popup-state';

const mainKey = 'mainKey';
const windowResizeKey = 'windowResizeKey';
const windowSettingsKey = 'windowSettingsKey';
const windowCloseEvent = 'closeWindow';
const windowMoveEvent = 'windowMoveEvent';
export const saveCommand = 'saveCommand';

export interface WindowPopupConfig {
  layoutConfig: any;
  hideWindowHeaderInstruments?: boolean;
  enableKeyEvents?: boolean;
}

@Injectable()
export class WindowPopupManager {
  private _state = {};
  windows = [];

  hideWindowHeaderInstruments = false;

  constructor(private _storage: Storage,
              private _route: ActivatedRoute,
              private storage: Storage,
              private windowMessengerService: WindowMessengerService,
              private injector: Injector,
  ) {
  }

  init(workspaces: Workspace[]) {
    if (isElectron()) {
      this.initDesktopSubscriptions(workspaces);
    }

    window.addEventListener('beforeunload', (event) => {
      if (this.isPopup()) {
        this.windowMessengerService.send(windowCloseEvent, this.getWindowInfo());
      } else {
        this.storage.setItem(windowSettingsKey, this._state);
      }
    });

    this.windowMessengerService.subscribe(windowCloseEvent, ({ windowId, workspaceId, }) => {
      delete this._state[hash(windowId, workspaceId)];
    });
  }

  initDesktopSubscriptions(workspaces) {
    let interval;
    window.addEventListener('mouseout', (evt) => {
      if (evt['toElement'] === null && evt.relatedTarget === null) {
        interval = setInterval(() => {
          if (this.isPopup()) {
            this.windowMessengerService.send(windowMoveEvent, {
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
        this.windowMessengerService.send(windowResizeKey, {
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

    this.windowMessengerService.subscribe(windowResizeKey, ({ windowId, workspaceId, bounds }) => {
      this._state[hash(windowId, workspaceId)] = { bounds, windowId, workspaceId };
    });
    this.windowMessengerService.subscribe(windowMoveEvent, ({ windowId, workspaceId, coords }) => {
      const bounds = this._state[hash(windowId, workspaceId)]?.bounds;
      if (!bounds)
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
    widgetFeatures.set('innerHeight', `${ height }`);
    widgetFeatures.set('innerWidth', `${ width }`);
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
    windowFeatures.set('height', `${ height }`);
    windowFeatures.set('width', `${ width }`);

    if (bounds.x != null)
      windowFeatures.set('left', `${ bounds.x }`);
    if (bounds.y != null)
      windowFeatures.set('top', `${ bounds.y }`);

    const queryParams = new URLSearchParams();
    queryParams.append('popup', 'true');
    queryParams.append('workspaceId', `${ workspace.id }`);
    queryParams.append('windowId', `${ workspaceWindow.id }`);

    const config: WindowPopupConfig = { layoutConfig, hideWindowHeaderInstruments: false };
    this.onWindowOpened(workspace, workspaceWindow, bounds);
    this._openPopup(config, queryParams, windowFeatures);
  }

  private _openPopup(config, queryParams: URLSearchParams, features: Map<string, string>) {
    const featuresArray = [];
    features.forEach((value, key) => {
      featuresArray.push(`${ key }=${ value }`);
    });
    this._storage.setItem(popupStorageKey, JSON.stringify(config));
    const popup = window.open(window.location.origin + '?' + queryParams.toString(), '', featuresArray.join(', '));
    this.windows.push(popup);
    return popup;
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
}

const commonFeatures = new Map([
  ['location', 'no'],
  ['status', 'no'],
  ['toolbar', 'no'],
  ['menubar', 'no']
]);

export function hash(windowId, workspaceId) {
  return `${ windowId }.${ workspaceId }`;
}
