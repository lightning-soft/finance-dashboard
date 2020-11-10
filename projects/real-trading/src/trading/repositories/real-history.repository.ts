import { Injectable } from '@angular/core';
import { HttpRepository, IBaseItem, IPaginationResponse } from 'communication';
import { IBar } from 'projects/chart/src/models/chart';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IConnection } from 'trading';

declare const moment: any;

export interface IHistoryItem extends IBaseItem, IBar {}

@Injectable()
export class RealHistoryRepository extends HttpRepository<IHistoryItem> {

  private _connection: IConnection;

  protected get _baseUrl(): string {
    return this._communicationConfig.rithmic.http.url + 'History';
  }

  protected get _apiKey(): string {
    return this._connection?.connectionData?.apiKey;
  }

  protected get _httpOptions() {
    return {
      headers: {
        'Api-Key': this._apiKey ?? '',
      },
    };
  }

  forConnection(connection: IConnection) {
    if (this._connection && this._connection?.id === connection?.id)
      return this;

    const repository = new RealHistoryRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );

    repository._connection = connection;

    return repository;
  }

  getItems(params: { id: string }): Observable<IPaginationResponse<IHistoryItem>> {
    return super.getItems(params).pipe(
      map((res: any) => {
        const data = res.result.map(item => ({
          date: moment.utc(item.timestamp).toDate(),
          open: item.openPrice,
          close: item.closePrice,
          high: item.highPrice,
          low: item.lowPrice,
          volume: item.volume,
        }));

        return { data } as IPaginationResponse<IHistoryItem>;
      }),
    );
  }
}
