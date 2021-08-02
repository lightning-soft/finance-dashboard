import { WindowPopupManager } from 'layout';
import { Injectable } from '@angular/core';
import { SettingsService } from 'settings';
import { WorkspacesManager } from 'workspace-manager';
import { SaveLoaderService } from 'ui';
import { WindowMessengerService } from 'window-messenger';

export const saveLayoutKey = 'saveLayout';

@Injectable({ providedIn: 'root' })
export class SaveLayoutConfigService {
  constructor(
    private _windowPopupManager: WindowPopupManager,
    private _settingsService: SettingsService,
    private _workspaceService: WorkspacesManager,
    private _loaderService: SaveLoaderService,
    private messengerService: WindowMessengerService
  ) {
  }

  async save(config) {
    if (this._windowPopupManager.isWindowPopup()) {
      const state = { ...this._windowPopupManager.getSaveConfigs(), state: config };
      this.messengerService.send(saveLayoutKey, state);
      const hide = this._loaderService.showLoader();
      hide();
    } else if (this._workspaceService.getActiveWorkspace()) {
      this._windowPopupManager.sendSaveCommand();
      await this._workspaceService.saveWorkspaces(this._workspaceService.getActiveWorkspace().id, config);
    }
  }
}
