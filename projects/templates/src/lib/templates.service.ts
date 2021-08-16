import { Injectable } from '@angular/core';
import { IBaseTemplate } from "./models";
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of, Subscription, throwError } from "rxjs";
import { SettingsService } from "settings";
import { Id, Repository } from "base-components";
import { ExcludeId, IPaginationResponse, RepositoryAction, RepositoryActionData } from "communication";

@UntilDestroy()
@Injectable()
export class TemplatesService extends Repository<IBaseTemplate> {
  get templates(): IBaseTemplate[] {
    return this._settingsService.settings.value.templates;
  }

  constructor(private _settingsService: SettingsService) {
    super();
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
    const id = Date.now();
    const newTemplate: IBaseTemplate = { ...template, id } as IBaseTemplate;
    this._settingsService.saveTemplates([...this.templates, newTemplate]);

    return of(newTemplate);
  }

  updateItem(template: IBaseTemplate): Observable<any> {
    const templates = (this.templates || []).map(i => i.id === template.id ? template : i);
    this._settingsService.saveTemplates(templates);

    return of(template);
  }

  deleteItem(id: Id): Observable<boolean> {
    this._settingsService.saveTemplates(this.templates?.filter(i => i.id !== id));

    return of(true);
  }

  subscribe(callback: (data: RepositoryActionData<IBaseTemplate>) => void): Subscription {
    return this._settingsService.settings.pipe(untilDestroyed(this)).subscribe((data) => {
      callback({ action: RepositoryAction.Update, items: data.templates });
    });
  }

  deleteMany(params: any): Observable<boolean> {
    return throwError('deleteMany method does not implement');
  }
}
