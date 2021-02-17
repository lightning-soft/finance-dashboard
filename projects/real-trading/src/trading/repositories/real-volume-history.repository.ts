import { Injectable } from '@angular/core';
import { IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VolumeHistoryItem } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealVolumeHistoryRepository extends BaseRepository<VolumeHistoryItem> {
  protected get suffix(): string {
    return 'History';
  }

  _getRepository() {
    return new RealVolumeHistoryRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItems(params: { symbol: string }): Observable<IPaginationResponse<VolumeHistoryItem>> {
    return super.getItems({ id: `${params.symbol}/volume`, ...params }).pipe(
      map((res: any) => {
        let data = res.result;

        if (!Array.isArray(data))
          data = [];

        return { data } as IPaginationResponse<VolumeHistoryItem>;
      }),
    );
  }
}
