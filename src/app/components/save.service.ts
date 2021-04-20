import { WindowPopupManager } from 'layout';
import { Injectable } from '@angular/core';
import { SettingsService } from 'settings';
import { WorkspacesManager } from 'workspace-manager';
import { SaveLoaderService } from 'ui';

@Injectable({ providedIn: 'root' })
export class SaveService {
  constructor(
    private _windowPopupManager: WindowPopupManager,
    private _settingsService: SettingsService,
    private _workspaceService: WorkspacesManager,
    private _loaderService: SaveLoaderService,
  ) {
  }

  async save(config) {
    if (this._windowPopupManager.isWindowPopup()) {
      const state = { ...this._windowPopupManager.getSaveConfigs(), state: config };
      const message = JSON.stringify(state);
      window?.opener.postMessage(message, window.location.origin);
      const hide = this._loaderService.showLoader();
      hide();
    } else if (this._workspaceService.getActiveWorkspace()) {
      await this._workspaceService.saveWorkspaces(this._workspaceService.getActiveWorkspace().id, config);
    }
  }
}
