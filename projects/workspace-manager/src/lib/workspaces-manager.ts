import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { blankBase, Workspace, WorkspaceWindow } from './workspace';
import { WorkspacesStore } from './workspaces-storage';
import { Id } from 'communication';
import { NotifierService } from 'notifier';

export type WorkspaceId = number | string;

const DEFAULT_NAME = 'Default';

@Injectable()
export class WorkspacesManager {

  public workspaces: BehaviorSubject<Workspace[]> = new BehaviorSubject([]);
  public reloadWorkspace$ = new Subject<void>();
  public reloadWindows$ = new Subject<void>();
  public save$ = new Subject<void>();
  public deletedWindow$ = new Subject<WorkspaceWindow>();
  public workspaceInit = new BehaviorSubject<boolean>(false);

  constructor(private _workspacesStore: WorkspacesStore, private _notifier: NotifierService) {
    this._init();
  }

  private _init() {
    this._workspacesStore
      .getItems()
      .subscribe(
        (w) => this._handleStoreWorkspaces(w),
        (e) => console.error(`Something goes wrong ${ e.message }`)
      );
  }

  public save() {
    this.updateWorkspaces();
    this.save$.next();
  }

  getWindowById(workspaceId: Id, windowId: Id) {
    return this.workspaces.value.find(item => item.id == workspaceId)
      ?.windows.find(item => item.id == windowId);
  }

  getWorkspaceById(workspaceId: Id) {
    return this.workspaces.value.find(item => item.id == workspaceId);
  }

  private _handleStoreWorkspaces(workspaces: Workspace[]) {
    if (workspaces && workspaces.length) {

      if (!workspaces.find(w => w.isActive))
        workspaces[0].isActive = true;

      const workspace = workspaces.find(item => item.isActive);
      workspace.windows = workspace.windows.map(item => {
        item.isSelected = item.isOnStartUp;
        return item;
      });
      this.workspaces.next(workspaces);
      this.reloadWorkspace$.next();
    } else {
      this.createWorkspace(DEFAULT_NAME);
    }
    this.workspaceInit.next(true);
  }

  public async createWorkspace(name: string, base?: WorkspaceId): Promise<void> {
    const workspace = new Workspace(name);
    if (this.workspaces.value.some(item => item.name === name)) {
      this._notifier.showError('Can\'t duplicate names');
      return;
    }
    let workspaces = [...this.workspaces.value, workspace];


    if (base != null && base !== blankBase) {
      this.save$.next();
      const baseWorkspace = workspaces.find(w => w.id === base);
      workspace.windows = jQuery.extend(true, [], baseWorkspace.windows);
      this.workspaces.next(workspaces);
    } else {
      const window = this.createBlankWindow();
      workspace.windows.push(window);
    }
    this.save$.next();
    workspaces = this._switchWorkspace(workspaces, workspace.id);
    this.workspaces.next(workspaces);
    this.reloadWorkspace$.next();
  }

  private createBlankWindow() {
    const window = new WorkspaceWindow();
    window.isOnStartUp = true;
    window.isSelected = true;
    return window;
  }

  public switchWorkspace(id: WorkspaceId, emitSave = true): void {
    if (emitSave) {
      this.save$.next();
    }

    const workspaces = this._switchWorkspace(this.workspaces.value, id);
    this.workspaces.next(workspaces);
    this.reloadWorkspace$.next();
  }

  private _switchWorkspace(workspaces: Workspace[], id: WorkspaceId): Workspace[] {
    for (const workspace of workspaces) {
      if (workspace.isActive)
        workspace.isActive = false;

      if (workspace.id === id) {
        workspace.isActive = true;
        workspace.windows = workspace.windows.map(w => ({ ...w, isSelected: w.isOnStartUp }));
      }
    }

    return workspaces;
  }

  public deleteWorkspace(id: WorkspaceId): void {
    const workspace = this.workspaces.value.find(w => w.id == id);

    const workspaces = this.workspaces.value.filter(w => w.id !== id);

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
      this.reloadWorkspace$.next();
  }

  public getWorkspaceConfig() {
    return this.getActiveWorkspace().windows.reduce((total, current) => {
      return [...total, ...current.config];
    }, []);
  }

  public getConfig() {
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

  public updateWindow(workspaceId: WorkspaceId, windowId: Id, state: any) {
    const workspace = this.workspaces.value.find(w => w.id === workspaceId);

    if (!workspace)
      return;

    const workspaceWindow = workspace.windows.find(item => item.id === windowId);
    if (!workspaceWindow)
      return;

    workspaceWindow.config = state;
    this.workspaces.next(this.workspaces.value);
  }

  public async saveWindow(workspaceId: WorkspaceId, windowId: Id, state: any) {
    this.updateWindow(workspaceId, windowId, state);
    await this._workspacesStore.setItems(this.workspaces.value).toPromise();
  }

  public renameWorkspace(id: WorkspaceId, name: string): void {
    if (this.workspaces.value.some(item => id !== item.id && item.name === name)) {
      this._notifier.showError('Can\'t duplicate names');
      return;
    }
    const workspace = this.workspaces.value.find(w => w.id === id);
    workspace.name = name;

    const workspaces = this.workspaces.value.map(w => w.id === id ? workspace : w);
    this._workspacesStore.setItems(workspaces);
    this.save$.next();
  }

  public duplicateWorkspace(id: WorkspaceId): void {
    const workspace = this.workspaces.value.find(w => w.id === id);
    const name = `${ workspace.name }(copy)`;
    this.createWorkspace(name, id);
  }

  getActiveWorkspace() {
    return this.workspaces.value.find(item => item.isActive);
  }

  getCurrentWindow() {
    return this.getActiveWorkspace()?.windows.find(item => item.isSelected);
  }

  loadOnStartUp(id): void {
    const workspace = this.getActiveWorkspace();
    workspace.windows = workspace.windows.map(item => {
      item.isOnStartUp = item.id === id;
      return item;
    });
    this.updateWorkspaces();
    this.save$.next();
  }

  switchWindow(windowId) {
    const workspace = this.getActiveWorkspace();
    workspace.windows = workspace.windows.map(item => {
      item.isSelected = item.id === windowId;
      return item;
    });
    this.reloadWindows$.next();

    this.updateWorkspaces();
  }

  renameWindow(id: any, result: any) {
    const workspace = this.getActiveWorkspace();
    if (workspace.windows.some((value) => value.id !== id && result === value.name)) {
      this._notifier.showError('Can\t duplicate names');
      return;
    }
    const workspaceWindow = workspace.windows.find(item => item.id === id);
    workspaceWindow.name = result;
    this.workspaces.next(this.workspaces.value);
    this._workspacesStore.setItems(this.workspaces.value);
  }

  duplicateWindow(windowId: any): WorkspaceWindow {
    const workspace = this.getActiveWorkspace();
    const window = workspace.windows.find(item => item.id === windowId);
    const newWindow = new WorkspaceWindow(window);
    newWindow.name = `${ window.name }(copy)`;
    workspace.windows.push(newWindow);
    this.save();
    return newWindow;
  }

  deleteWindow(id: any) {
    const workspace = this.getActiveWorkspace();
    const deletedWindow = workspace.windows.find(item => item.id === id);
    this.deletedWindow$.next(deletedWindow);
    workspace.windows = workspace.windows.filter(item => item.id !== id);

    if (workspace.windows && workspace.windows.length && workspace.windows.every(item => !item.isOnStartUp)) {
      workspace.windows[0].isOnStartUp = true;
    }

    if (!workspace.windows.length) {
      const workspaceWindow = this.createBlankWindow();
      workspace.windows.push(workspaceWindow);
      this.switchWindow(workspaceWindow.id);
    } else if (workspace.windows.every(item => !item.isSelected)) {
      const w = workspace.windows[0];
      this.switchWindow(w.id);
    } else {
      this.updateWorkspaces();
    }
  }

  createWindow(workspaceWindow: WorkspaceWindow): WorkspaceWindow {
    const workspace = this.getActiveWorkspace();
    if (workspace.windows.some(item => workspaceWindow.name === item.name)) {
      this._notifier.showError('Can\'t duplicate names');
      return null;
    }
    workspace.windows.push(workspaceWindow);
    this.updateWorkspaces();
    return workspaceWindow;
  }

  updateWorkspaces() {
    this.workspaces.next(this.workspaces.value);
  }

  checkIfCurrentWindow(workspaceId: any, windowId: any) {
    return this.getActiveWorkspace()?.id === workspaceId && this.getCurrentWindow()?.id === windowId;
  }
}
