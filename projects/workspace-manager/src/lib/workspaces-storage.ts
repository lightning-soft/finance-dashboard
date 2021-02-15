import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Workspace } from './workspace';
import { SettingsService } from 'projects/settings/src/settings.service';
import { map, skip, take, tap } from 'rxjs/operators';


@Injectable()
export class WorkspacesStore {
  constructor(private settingsService: SettingsService) {
  }

  setItems(data: any): Observable<void> {
    return of(this.settingsService.saveWorkspaces(data));
  }

  getItems(): Observable<Workspace[]> {
    return this.settingsService.settings.pipe(map(item => {
        return item.workspaces;
      }),
      skip(1),
      take(1),
      tap((data) => {
        console.warn(data);
      })
    );
  }

  deleteItem(id: any): Observable<void> {
    const items: any[] = this.settingsService.settings.value.workspaces;

    return of(this.settingsService.saveWorkspaces(items.filter(i => i.id !== id)));
  }

  setItemConfig(configId: any, data: any): Observable<void> {
    const workspaces = this.settingsService.settings.value.workspaces;
    const workspace = workspaces.find(item => item.configId === configId);
    workspace.config = data;
    return of(this.settingsService.saveWorkspaces(workspaces));
  }

  getItemConfig(configId: any): Observable<any[]> {
    const workspaces = this.settingsService.settings.value.workspaces;
    const workspace = workspaces.find(item => item.configId === configId);
    return of(workspace.config);
  }

  deleteItemConfig(configId: any): Observable<void> {
    const workspaces = this.settingsService.settings.value.workspaces;
    const workspace = workspaces.find(item => item.configId === configId);
    if (workspace)
      delete workspace.config;
    return of(this.settingsService.saveWorkspaces(workspaces));
  }

}
