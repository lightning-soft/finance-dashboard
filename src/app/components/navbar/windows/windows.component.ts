import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CreateModalComponent } from '../workspace/create-modal/create-modal.component';
import { NzModalService } from 'ng-zorro-antd';
import { Workspace, WorkspacesManager, WorkspaceWindow } from 'workspace-manager';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Id } from 'communication';
import { LayoutComponent, WindowPopupManager } from 'layout';
import { RenameModalComponent } from '../workspace/rename-modal/rename-modal.component';
import { ConfirmModalComponent } from '../workspace/confirm-modal/confirm-modal.component';
import { SettingsService } from 'settings';
import { FormControl } from '@angular/forms';

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
  formControl = new FormControl();
  isSelectOpened = false;
  @Input() layout: LayoutComponent;
  @Output() handleToggleDropdown = new EventEmitter<boolean>();

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
    this.formControl.patchValue(this.currentWindowId);
  }

  ngOnInit(): void {
  }

  rename(id: any) {
    const window = this.windows.find(w => w.id === id);

    const modal = this._modalService.create({
      nzTitle: 'Rename window',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWidth: 438,
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        name: window.name,
        label: 'Name workspace'
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
      nzWrapClassName: 'modal-workspace confirm-modal-workspace vertical-center-modal',
      nzComponentParams: {
        message: 'Do you want delete the window?',
        confirmText: 'Yes',
        cancelText: 'No',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result.confirmed)
        this._workspacesService.deleteWindow(id);
    });
  }

  duplicate(id: any) {
    this.updateWindow();
    const window = this._workspacesService.duplicateWindow(id);
    this.selectWindow(window.id);
  }

  createWindow() {
    const modal = this._modalService.create({
      nzWidth: 440,
      nzTitle: 'New window',
      nzContent: CreateModalComponent,
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        name: 'Name new window',
        blankOption: 'Blank window',
        options: this.windows.map(item => ({ value: item.id, label: item.name })),
      },
    });

    modal.afterClose.subscribe(result => {
      if (!result)
        return;

      let config = [];
      this.updateWindow();

      if (result.base)
        config = this.windows.find(item => item.id === result.base)?.config;

      const workspaceWindow = this._workspacesService.createWindow(new WorkspaceWindow({
        name: result.name,
        config,
      }));

      this.selectWindow(workspaceWindow.id);
    });
  }

  selectWindow(windowId: Id) {
    if (this.currentWindowId !== windowId) {
      this.updateWindow();
      this._workspacesService.switchWindow(windowId);
      this.isSelectOpened = false;
    }
  }

  updateWindow() {
    this._workspacesService.updateWindow(this._workspacesService.getActiveWorkspace().id, this.currentWindowId, this.layout.getState());
  }

  save() {
    this._workspacesService.save();
  }

  loadOnStartUp(id) {
    this._workspacesService.loadOnStartUp(id);
  }

  popupWindow(window: WorkspaceWindow) {
    this._windowPopupManager.openWindow(this.currentWorkspace, window);
  }
}
