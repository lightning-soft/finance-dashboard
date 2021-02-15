import { Component, Input, OnInit } from '@angular/core';
import { LayoutComponent } from 'layout';
import { NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { Workspace, WorkspaceId, WorkspacesManager } from 'workspace-manager';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { CreateModalComponent } from './create-modal/create-modal.component';
import { RenameModalComponent } from './rename-modal/rename-modal.component';
import { SettingsService } from 'settings';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {

  @Input() layout: LayoutComponent;

  activeWorkspaceId: WorkspaceId;

  workspaces: Workspace[] = [];
  isMenuVisible: boolean;

  constructor(
    private _workspacesService: WorkspacesManager,
    private _modalService: NzModalService,
    private _settingsService: SettingsService,
    private _notificationService: NotifierService,
  ) {
  }

  ngOnInit(): void {
    this._workspacesService.workspaces.subscribe((workspaces: Workspace[]) => {
      this.workspaces = [...workspaces];

      const activeWorkspace = workspaces.find(w => w.isActive);
      this.activeWorkspaceId = activeWorkspace.id;
    });
  }


  rename(id: WorkspaceId) {
    const workspace = this.workspaces.find(w => w.id === id);

    const modal = this._modalService.create({
      nzTitle: 'Rename workspace',
      nzContent: RenameModalComponent,
      nzClassName: 'modal-dialog-workspace',
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        workspaceName: workspace.name
      },
    });

    modal.afterClose.subscribe(result => {
      if (result)
        this._workspacesService.renameWorkspace(id, result);
    });
  }

  delete(id: WorkspaceId) {
    const modal = this._modalService.create({
      nzTitle: 'Delete workspace',
      nzContent: ConfirmModalComponent,
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        message: 'Do you want delete the workspace?'
      },
    });

    modal.afterClose.subscribe(result => {
      if (result)
        this._workspacesService.deleteWorkspace(id);
    });
  }

  duplicate(id: WorkspaceId) {
    this._workspacesService.duplicateWorkspace(id);
  }

  share(id: WorkspaceId) {
    console.log('Share workspace');
  }

  switchWorkspace($event) {
    if (this._settingsService.settings.value.autoSave) {
      this.activeWorkspaceId = $event;
      this._workspacesService.switchWorkspace(this.activeWorkspaceId);
    }
    else {
      const modal = this._modalService.create({
        nzTitle: 'Saving workspace',
        nzContent: ConfirmModalComponent,
        nzWrapClassName: 'modal-workspace vertical-center-modal',
        nzComponentParams: {
          message: 'Do you want save changes in workspace?',
          confirmText: 'Yes',
          cancelText: 'No'
        },
      });
      modal.afterClose.subscribe(async (res) => {
        if (res) {
          await this._workspacesService.saveWorkspaces(this.activeWorkspaceId, this.layout.saveState());
          this.activeWorkspaceId = $event;
          this._workspacesService.switchWorkspace(this.activeWorkspaceId);
        } else {
          this.activeWorkspaceId = $event;
          this._workspacesService.switchWorkspace(this.activeWorkspaceId);
        }
      });
    }
  }

  createWorkspace() {
    const modal = this._modalService.create({
      nzTitle: 'New workspace',
      nzContent: CreateModalComponent,
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        workspaces: [...this.workspaces],
      },
    });

    modal.afterClose.subscribe(result => {
      if (!result)
        return;

      const base = result.base !== 'blank' ? result.base : null;

      this._workspacesService.createWorkspace(result.workspaceName, base)
    });
  }

  saveWorkspace() {
    this._workspacesService.saveWorkspaces(this.activeWorkspaceId, this.layout.saveState());
    this._notificationService.showSuccess('Workspace was saved');
  }


}
