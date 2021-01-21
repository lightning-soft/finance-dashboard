import { CommunicationConfig, HttpRepository } from 'communication';
import { ISettings } from 'trading';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector, Optional } from '@angular/core';
import { AuthService } from 'auth';
import { Observable } from 'rxjs';
const settingKey = 'setting';
@Injectable()
export class RealSettingsRepository extends HttpRepository<ISettings> {
  protected get _baseUrl(): string {
    return this._communicationConfig[settingKey].url + 'api/GeneralUserSetting';
  }

  constructor(
    @Inject(HttpClient) protected _http: HttpClient,
    @Optional() @Inject(CommunicationConfig) protected _communicationConfig: CommunicationConfig,
    private authService: AuthService,
    @Optional() @Inject(Injector) protected _injector: Injector) {
    super(_http, _communicationConfig, _injector);
  }
  updateItem(item: ISettings, query?: any): Observable<ISettings> {
    return this._http.put<any>(this._getRESTURL(), item);
  }
}
