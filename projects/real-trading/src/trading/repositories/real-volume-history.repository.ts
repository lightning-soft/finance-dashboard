import { Injectable } from '@angular/core';
import { IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { VolumeHistoryItem } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealVolumeHistoryRepository extends BaseRepository<VolumeHistoryItem> {
  protected get suffix(): string {
    return 'History';
  }

  getItems(params: { symbol: string }): Observable<IPaginationResponse<VolumeHistoryItem>> {
    return super.getItems({ id: `${params.symbol}/volume`, ...params });
  }
}
