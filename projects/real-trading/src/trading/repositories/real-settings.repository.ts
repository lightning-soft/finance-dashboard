import { Injectable } from '@angular/core';
import { HttpRepository, IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { ISettings } from 'trading';

@Injectable()
export class RealSettingsRepository extends HttpRepository<ISettings> {
  protected get _baseUrl(): string {
    return this._communicationConfig.setting.url + 'api/GeneralUserSetting';
  }

  updateItem(item: ISettings, query?: any): Observable<ISettings> {
    return this._http.put<any>(this._getRESTURL(), item);
  }

  protected _mapItemsResponse(res: any, params: any): IPaginationResponse<ISettings> {
    return { ...res, requestParams: params };
  }
}
