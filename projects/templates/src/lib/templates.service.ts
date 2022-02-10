import { Injectable } from '@angular/core';
import { IBaseTemplate } from './models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { SettingsService } from 'settings';
import { Id, Repository } from 'base-components';
import { ExcludeId, IPaginationResponse, RepositoryAction, RepositoryActionData } from 'communication';
import { WindowPopupManager } from 'layout';
import { WindowMessengerService } from 'window-messenger';

const savePresetsCommand = 'savePresetsCommand';
const applyPresetsCommand = 'applyPresetsCommand';

@UntilDestroy()
@Injectable()
export class TemplatesService extends Repository<IBaseTemplate> {
  get templates(): IBaseTemplate[] {
    return this._settingsService.settings.value.templates;
  }

  constructor(private _settingsService: SettingsService,
              private _windowPopupManager: WindowPopupManager,
              private _windowMessengerService: WindowMessengerService,
  ) {
    super();
    this._windowMessengerService.subscribe(savePresetsCommand, (data) => {
        this.save(data);
    });
    this._windowMessengerService.subscribe(applyPresetsCommand, (data) => {
      this._settingsService.saveTemplates(data, false);
    });
  }

  getItems(params?): Observable<IPaginationResponse<IBaseTemplate>> {
    const templatesCount = this.templates.length;
    return of({
      data: this.templates,
      count: templatesCount,
      pageCount: templatesCount,
      page: 1,
      total: templatesCount
    });
  }

  getItemById(id: Id): Observable<IBaseTemplate> {
    return of(this.templates?.find(i => i.id === id));
  }

  createItem(template: ExcludeId<IBaseTemplate>): Observable<IBaseTemplate> {
    if (this.templates.some((item) => item.type === template.type && item.name === template.name))
      return throwError('Duplicated names aren\'t allowed');

    const id = Date.now();
    const newTemplate: IBaseTemplate = {...template, id} as IBaseTemplate;
    this.save([...this.templates, newTemplate]);
    return of(newTemplate);
  }

  updateItem(template: IBaseTemplate): Observable<any> {
    const filteredTemplates = this.templates.filter(item => item.type === template.type && item.id !== template.id);
    if (filteredTemplates.some((item) => item.name === template.name))
      return throwError('Duplicated names aren\'t allowed');

    const templates = (this.templates || []).map(i => i.id === template.id ? template : i);
    this.save(templates);

    return of(template);
  }

  save(templates) {
    if (this._windowPopupManager.isWindowPopup()) {
      this._windowMessengerService.send(savePresetsCommand, templates);
      this._settingsService.saveTemplates(templates, false);
    } else {
      this._settingsService.saveTemplates(templates);
      this._windowPopupManager.sendCommandToSubwindows(applyPresetsCommand, templates);
    }
  }

  deleteItem(id: Id): Observable<boolean> {
    this._settingsService.saveTemplates(this.templates?.filter(i => i.id !== id));

    return of(true);
  }

  subscribe(callback: (data: RepositoryActionData<IBaseTemplate>) => void): Subscription {
    return this._settingsService.settings.pipe(untilDestroyed(this)).subscribe((data) => {
      callback({action: RepositoryAction.Update, items: data.templates});
    });
  }

  deleteMany(params: any): Observable<boolean> {
    return throwError('deleteMany method does not implement');
  }
}
