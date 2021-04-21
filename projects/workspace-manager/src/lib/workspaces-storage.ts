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
    );
  }

  deleteItem(id: any): Observable<void> {
    const items: any[] = this.settingsService.settings.value.workspaces;

    return of(this.settingsService.saveWorkspaces(items.filter(i => i.id !== id)));
  }
}
