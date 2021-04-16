import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { blankBase, Workspace, WorkspaceWindow } from './workspace';
import { WorkspacesStore } from './workspaces-storage';
import { Id } from "communication";

export type WorkspaceId = number | string;

const DEFAULT_NAME = 'Default';

@Injectable()
export class WorkspacesManager {

  public workspaces: BehaviorSubject<Workspace[]> = new BehaviorSubject([]);
  public reload = new Subject<void>();
  public save = new Subject<void>();
  public workspaceInit = new BehaviorSubject<boolean>(false);

  constructor(private _workspacesStore: WorkspacesStore) {
    this._init();
  }

  private _init() {
    this._workspacesStore
      .getItems()
      .subscribe(
        (w) => this._handleStoreWorkspaces(w),
        (e) => console.error(`Something goes wrong ${e.message}`)
      );
  }

  private _handleStoreWorkspaces(workspaces: Workspace[]) {
    if (workspaces && workspaces.length) {

      if (!workspaces.find(w => w.isActive))
        workspaces[0].isActive = true;

      this.workspaces.next(workspaces);
      const workspace = this.getActiveWorkspace();
      workspace.windows = workspace.windows.map(item => {
        item.isSelected = item.isOnStartUp;
        return item;
      });
      this.updateWorkspaces();
      this.reload.next();
    } else {
      this.createWorkspace(DEFAULT_NAME);
    }
    this.workspaceInit.next(true);
  }

  public async createWorkspace(name: string, base?: WorkspaceId): Promise<void> {
    const workspace = new Workspace(name);

    let workspaces = [...this.workspaces.value, workspace];
    workspaces = this._switchWorkspace(workspaces, workspace.id);


    if (base != null && base !== blankBase) {
      const baseWorkspace = workspaces.find(w => w.id === base);
      workspace.windows = baseWorkspace.windows;
    } else {
      const window = this.createBlankWindow();
      workspace.windows.push(window);
    }

    this._workspacesStore.setItems(workspaces);
    // this._workspacesStore.setItemConfig(workspace.configId, workspaceConfig);

    this.workspaces.next(workspaces);
    this.reload.next();
    this.save.next();
  }

  private createBlankWindow() {
    const window = new WorkspaceWindow();
    window.isOnStartUp = true;
    window.isSelected = true;
    return window;
  }

  public switchWorkspace(id: WorkspaceId, emitSave = true): void {
    if (emitSave) {
      this.save.next();
    }

    const workspaces = this._switchWorkspace(this.workspaces.value, id);
    this.workspaces.next(workspaces);
    this.reload.next();
  }

  private _switchWorkspace(workspaces: Workspace[], id: WorkspaceId): Workspace[] {
    for (const workspace of workspaces) {
      if (workspace.isActive)
        workspace.isActive = false;

      if (workspace.id === id)
        workspace.isActive = true;
    }

    return workspaces;
  }

  public deleteWorkspace(id: WorkspaceId): void {
    const workspace = this.workspaces.value.find(w => w.id == id);

    const workspaces = this.workspaces.value.filter(w => w.id !== id)

    if (!workspaces.length) {
      const w = new Workspace(DEFAULT_NAME);
      w.windows.push(this.createBlankWindow());
      workspaces.push(w);
    }

    if (workspace.isActive)
      workspaces[0].isActive = true;

    this._workspacesStore.deleteItem(id);
    // this._workspacesStore.deleteItemConfig(workspace.configId);

    this.workspaces.next(workspaces);
    if (workspace.isActive)
      this.reload.next();
  }

  public getWorkspaceConfig() {
    return this.getCurrentWindow()?.config;
  }

  public async saveWorkspaces(id: WorkspaceId, state: any) {
    const workspace = this.workspaces.value.find(w => w.id === id);

    if (!workspace)
      return;
    const window = workspace.windows.find(item => item.isSelected);
    if (!window)
      return;
    window.config = state;
    this.workspaces.next(this.workspaces.value);
    await this._workspacesStore.setItems(this.workspaces.value).toPromise();
  }

  public async saveWindow(workspaceId: WorkspaceId, windowId: Id, state: any) {
    const workspace = this.workspaces.value.find(w => w.id === workspaceId);

    if (!workspace)
      return;
    const window = workspace.windows.find(item => item.id = windowId);
    if (!window)
      return;
    window.config = state;
    this.workspaces.next(this.workspaces.value);
    await this._workspacesStore.setItems(this.workspaces.value).toPromise();
  }

  public renameWorkspace(id: WorkspaceId, name: string): void {
    const workspace = this.workspaces.value.find(w => w.id === id);
    workspace.name = name;

    const workspaces = this.workspaces.value.map(w => w.id === id ? workspace : w);
    this._workspacesStore.setItems(workspaces);
    this.save.next();
  }

  public duplicateWorkspace(id: WorkspaceId): void {
    const workspace = this.workspaces.value.find(w => w.id === id);
    this.createWorkspace(workspace.name, id);
  }

  getActiveWorkspace() {
    return this.workspaces.value.find(item => item.isActive);
  }

  getCurrentWindow() {
    return this.getActiveWorkspace()?.windows.find(item => item.isSelected);
  }

  loadOnStartUp(id) {
    const workspace = this.getActiveWorkspace();
    workspace.windows = workspace.windows.map(item => {
      item.isOnStartUp = item.id === id;
      return item;
    });
    this.updateWorkspaces();
    this.save.next();
  }

  switchWindow(windowId, emitSave = true) {
    if (emitSave) {
      this.save.next();
    }

    const workspace = this.getActiveWorkspace();
    workspace.windows = workspace.windows.map(item => {
      item.isSelected = item.id === windowId;
      return item;
    });
    this.reload.next();

    this.updateWorkspaces();
  }

  renameWindow(id: any, result: any) {
    const workspace = this.getActiveWorkspace();
    const workspaceWindow = workspace.windows.find(item => item.id === id);
    workspaceWindow.name = result;
    this.workspaces.next(this.workspaces.value);
    this._workspacesStore.setItems(this.workspaces.value);
    this.save.next();
  }

  duplicateWindow(windowId: any) {
    this.save.next();
    const workspace = this.getActiveWorkspace();
    const window = workspace.windows.find(item => item.id === windowId);
    const newWindow = new WorkspaceWindow(window);
    workspace.windows.push(newWindow);
    this.switchWindow(newWindow.id);
  }

  deleteWindow(id: any) {
    const workspace = this.getActiveWorkspace();
    workspace.windows = workspace.windows.filter(item => item.id !== id);
    if (!workspace.windows.length) {
      const workspaceWindow = this.createBlankWindow();
      workspace.windows.push(workspaceWindow);
      this.switchWindow(workspaceWindow.id);
    } else if (workspace.windows.every(item => !item.isSelected)) {
      const w = workspace.windows[0];
      w.isOnStartUp = true;
      this.switchWindow(w.id);
    } else {
      this.updateWorkspaces();
      this._workspacesStore.setItems(this.workspaces.value);
      //  this.save
    }
  }

  createWindow(workspaceWindow: WorkspaceWindow) {
    const workspace = this.getActiveWorkspace();
    workspace.windows.push(workspaceWindow);
    this.updateWorkspaces();
    this.switchWindow(workspaceWindow.id);
  }

  updateWorkspaces() {
    this.workspaces.next(this.workspaces.value);
  }
}
