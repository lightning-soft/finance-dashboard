import { Component, Input, OnInit } from '@angular/core';
import { CreateModalComponent } from '../workspace/create-modal/create-modal.component';
import { NzModalService } from 'ng-zorro-antd';
import { Workspace, WorkspacesManager, WorkspaceWindow } from 'workspace-manager';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Id } from 'communication';
import { LayoutComponent, WindowPopupManager } from 'layout';
import { RenameModalComponent } from '../workspace/rename-modal/rename-modal.component';
import { ConfirmModalComponent } from '../workspace/confirm-modal/confirm-modal.component';
import { SettingsService } from 'settings';

@Component({
  selector: 'windows',
  templateUrl: './windows.component.html',
  styleUrls: ['./windows.component.scss']
})
@UntilDestroy()
export class WindowsComponent implements OnInit {
  windows: WorkspaceWindow[] = [];
  currentWorkspace: Workspace;
  currentWindowId;
  @Input() layout: LayoutComponent;

  constructor(private _modalService: NzModalService,
              private _settingsService: SettingsService,
              private _windowPopupManager: WindowPopupManager,
              private _workspacesService: WorkspacesManager,
  ) {
    this._workspacesService.workspaces
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.currentWorkspace = res.find(item => item.isActive);
        this.windows = this.currentWorkspace?.windows;
        this.updateCurrentWindow();
      });
  }

  updateCurrentWindow() {
    this.currentWindowId = this._workspacesService.getCurrentWindow()?.id;
  }

  ngOnInit(): void {
  }

  rename(id: any) {
    const window = this.windows.find(w => w.id === id);

    const modal = this._modalService.create({
      nzTitle: 'Rename window',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        workspaceName: window.name,
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result !== '')
        this._workspacesService.renameWindow(id, result);
    });
  }

  delete(id: any) {
    const modal = this._modalService.create({
      nzTitle: 'Delete window',
      nzContent: ConfirmModalComponent,
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        message: 'Do you want delete the window?'
      },
    });

    modal.afterClose.subscribe(result => {
      if (result)
        this._workspacesService.deleteWindow(id);
    });
  }

  duplicate(id: any) {
    this._workspacesService.duplicateWindow(id);
  }

  createWindow() {
    const modal = this._modalService.create({
      nzTitle: 'New window',
      nzContent: CreateModalComponent,
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        name: 'Name new window',
        blankOption: 'Blank window',
        options: [...this.windows.map(item => ({ value: item.id, label: item.name }))],
      },
    });

    modal.afterClose.subscribe(result => {
      if (!result)
        return;
      let config = [];
      if (result.base)
        config = this.windows.find(item => item.id === result.base)?.config;
      this._workspacesService.createWindow(new WorkspaceWindow({
        name: result.name,
        config,
      }));
    });
  }

  selectWindow(windowId: Id) {
    if (this.currentWindowId !== windowId) {
      if (this._settingsService.settings.value.autoSave) {
        this._saveAndSwitchWindow(windowId, false);
      } else {
        const modal = this._modalService.create({
          nzTitle: 'Saving window',
          nzContent: ConfirmModalComponent,
          nzWrapClassName: 'modal-workspace vertical-center-modal',
          nzComponentParams: {
            message: 'Do you want save changes in window?',
            confirmText: 'Yes',
            cancelText: 'No'
          },
        });
        modal.afterClose.subscribe(async (res) => {
          if (res) {
            this._saveAndSwitchWindow(windowId);
          } else {
            this._saveAndSwitchWindow(windowId, false);
          }
        });
      }

    }
  }

  private _saveAndSwitchWindow(windowId, saveInStorage = true) {
    this._workspacesService.switchWindow(windowId, saveInStorage);
    this.currentWindowId = windowId;
  }

  save() {
    this._workspacesService.save.next();
  }

  loadOnStartUp(id) {
    this._workspacesService.loadOnStartUp(id);
  }

  popupWindow(window: WorkspaceWindow) {
    this._windowPopupManager.openWindow(this.currentWorkspace, window);
  }
}
