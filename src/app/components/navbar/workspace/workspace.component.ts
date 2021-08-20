import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LayoutComponent, WindowPopupManager } from 'layout';
import { NzModalService, NzPlacementType } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { Workspace, WorkspaceId, WorkspacesManager } from 'workspace-manager';
import { SettingsService } from 'settings';
import { FormControl } from '@angular/forms';
import { Id } from 'communication';
import { ConfirmModalComponent, CreateModalComponent, RenameModalComponent } from 'ui';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  @Input() layout: LayoutComponent;
  @Input() dropdownPlacement: NzPlacementType;

  @Output() handleToggleDropdown = new EventEmitter<boolean>();

  activeWorkspaceId: WorkspaceId;
  formControl = new FormControl();

  workspaces: Workspace[] = [];
  isMenuVisible: boolean;

  constructor(
    private _workspacesService: WorkspacesManager,
    private _modalService: NzModalService,
    private _settingsService: SettingsService,
    private  _windowPopupManager: WindowPopupManager,
    private _notificationService: NotifierService,
  ) {
  }

  ngOnInit(): void {
    this._workspacesService.workspaces.subscribe((workspaces: Workspace[]) => {
      this.workspaces = [...workspaces];

      const activeWorkspace = workspaces.find(w => w.isActive);
      if (activeWorkspace) {
        this.activeWorkspaceId = activeWorkspace.id;
        this.formControl.patchValue(activeWorkspace.id);
      }
    });
  }


  rename(id: WorkspaceId) {
    const workspace = this.workspaces.find(w => w.id === id);

    const modal = this._modalService.create({
      nzTitle: 'Rename workspace',
      nzContent: RenameModalComponent,
      nzWidth: 438,
      nzClassName: 'modal-dialog-workspace',
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        name: workspace.name,
        label: 'Name workspace',
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
      nzWrapClassName: 'modal-workspace confirm-modal-workspace vertical-center-modal',
      nzComponentParams: {
        message: 'Do you want delete the workspace?',
        confirmText: 'Yes',
        cancelText: 'No',
      },
    });

    modal.afterClose.subscribe(result => {
      if (result && result.confirmed)
        this._workspacesService.deleteWorkspace(id);
    });
  }

  duplicate(id: WorkspaceId) {
    this._workspacesService.duplicateWorkspace(id);
  }

  share(id: WorkspaceId) {
    console.log('Share workspace');
  }

  switchWorkspace($event: Id): void {
    if (this.activeWorkspaceId === $event)
      return;

    if (this._settingsService.settings.value.autoSave) {
      this.activeWorkspaceId = $event;
      this.formControl.patchValue($event);
      this._workspacesService.switchWorkspace(this.activeWorkspaceId);
      this._windowPopupManager.sendCloseCommand();
    } else {
      const modal = this._modalService.create({
        nzTitle: 'Saving workspace',
        nzContent: ConfirmModalComponent,
        nzWrapClassName: 'modal-workspace confirm-modal-workspace vertical-center-modal',
        nzComponentParams: {
          message: 'Do you want save changes in workspace?',
          confirmText: 'Yes',
          cancelText: 'No'
        },
      });
      modal.afterClose.subscribe((result: any) => {
        if (!result) {
          this.formControl.patchValue(this.activeWorkspaceId);
          return;
        }
        if (result) {
          this.activeWorkspaceId = $event;
          this.formControl.patchValue($event);
          this._windowPopupManager.sendCloseCommand();
          this._workspacesService.switchWorkspace(this.activeWorkspaceId, result.confirmed);
        }
      });
    }
  }

  createWorkspace(): void {
    const modal = this._modalService.create({
      nzWidth: 440,
      nzTitle: 'New workspace',
      nzContent: CreateModalComponent,
      nzWrapClassName: 'modal-workspace vertical-center-modal',
      nzComponentParams: {
        name: 'Name new workspace',
        blankOption: 'Blank workspace',
        options: this.workspaces.map(item => ({ value: item.id, label: item.name })),
      },
    });

    modal.afterClose.subscribe(result => {
      if (!result)
        return;

      const base = result.base !== 'blank' ? result.base : null;

      this._workspacesService.createWorkspace(result.name, base);
    });
  }

  saveWorkspace() {
    this._workspacesService.save$.next();
    this._notificationService.showSuccess('Workspace was saved');
  }

  handleDropdownToggle(opened: boolean): void {
    this.isMenuVisible = opened;
    this.handleToggleDropdown.emit(opened);
  }
}
