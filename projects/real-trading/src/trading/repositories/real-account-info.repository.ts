import { BaseRepository } from './base-repository';
import { AccountInfo } from 'trading';
import { forkJoin, Observable, of } from 'rxjs';
import { IPaginationResponse } from 'communication';
import { catchError, map } from 'rxjs/operators';

export class RealAccountInfoRepository extends BaseRepository<AccountInfo> {
  protected get suffix() {
    return 'Account';
  }

  getItems({ connections }): Observable<IPaginationResponse<AccountInfo>> {
    return forkJoin(connections.map(connection => {
      return this._http.get(this._getRESTURL('info'), { ...this._httpOptions, ...this._mapItemParams({ connection }) })
        .pipe(
          map((item: any) => {
            item.result.forEach(info => info.connectionId = connection.id);
            return item;
          }),
          catchError((err) => of(null)));
    })).pipe(
      map((response: any) => {
        const data = response.filter(item => item).reduce((total, curr) => {
          return [...total, ...curr.result];
        }, []);
        return {
          data,
          total: data.length,
        } as IPaginationResponse;
      })
    );
  }
}
