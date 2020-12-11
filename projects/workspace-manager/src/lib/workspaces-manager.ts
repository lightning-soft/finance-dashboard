import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Workspace } from './workspace';
import { WorkspacesStore } from './workspaces-storage';

export type WorkspaceId = number | string;

const DEFAULT_NAME = 'Default';

@Injectable()
export class WorkspacesManager {

  public workspaces: BehaviorSubject<Workspace[]> = new BehaviorSubject([]);

  constructor(private _workspacesStore: WorkspacesStore) {
    this._init();
  }

  private _init() {
    this._workspacesStore
      .getItems()
      .subscribe(
        (w) => this._handleStoreWorkspaces(w),
        (e) => console.error(`Something goes wrong ${e.message}`)
      )
  }

  private _handleStoreWorkspaces(workspaces: Workspace[]) {
    if (workspaces && workspaces.length) {

      if (!workspaces.find(w => w.isActive))
        workspaces[0].isActive = true;

      this.workspaces.next(workspaces);
    } else {
      this.createWorkspace(DEFAULT_NAME);
    }
  }

  public async createWorkspace(name: string, base?: WorkspaceId): Promise<void> {
    const workspace = new Workspace(name);

    workspace.isActive = true;

    let workspaceConfig = [];

    if (base) {
      const baseWorkspace = this.workspaces.value.find(w => w.id === base);
      workspaceConfig = await this._workspacesStore.getItemConfig(baseWorkspace.configId).toPromise()
    }

    const workspaces = this.workspaces.value;

    for (const workspace of workspaces) {
      if (workspace.isActive)
        workspace.isActive = false;
    }

    workspaces.push(workspace);

    this._workspacesStore.setItems(workspaces);
    this._workspacesStore.setItemConfig(workspace.configId, workspaceConfig);

    this.workspaces.next(workspaces);

    this.switchWorkspace(workspace.id);
  }

  public switchWorkspace(id: WorkspaceId): void {
    const workspaces = this.workspaces.value;

    for (const workspace of workspaces) {
      if (workspace.isActive)
        workspace.isActive = false;

      if (workspace.id === id)
        workspace.isActive = true;
    }

    this.workspaces.next(workspaces);
  }

  public deleteWorkspace(id: WorkspaceId): void {
    const workspace = this.workspaces.value.find(w => w.id == id);

    const workspaces = this.workspaces.value.filter(w => w.id !== id)

    if (!workspaces.length)
      workspaces.push(new Workspace(DEFAULT_NAME));

    if (workspace.isActive)
      workspaces[0].isActive = true;

    this._workspacesStore.deleteItem(id);
    this._workspacesStore.deleteItemConfig(workspace.configId);

    this.workspaces.next(workspaces);
  }

  public getWorkspaceConfig(id: WorkspaceId): Observable<any> {
    return this._workspacesStore.getItemConfig(id);
  }

  public saveWorkspaces(id: WorkspaceId, state: any): void {
    const workspace = this.workspaces.value.find(w => w.id === id);

    if (!workspace)
      return;

    this._workspacesStore.setItemConfig(workspace.configId, state);
    this._workspacesStore.setItems(this.workspaces.value);
  }

  public renameWorkspace(id: WorkspaceId, name: string): void {
    const workspace = this.workspaces.value.find(w => w.id === id);
    workspace.name = name;

    const workspaces = this.workspaces.value.map(w => w.id === id ? workspace : w)
    this._workspacesStore.setItems(workspaces);
  }

  public duplicateWorkspace(id: WorkspaceId): void {
    const workspace = this.workspaces.value.find(w => w.id === id);
    this.createWorkspace(workspace.name, id);
  }

}
