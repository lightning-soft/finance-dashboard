import { BaseRepository } from './base-repository';
import { AccountInfo } from 'trading';
import { forkJoin, Observable, of } from 'rxjs';
import { IPaginationResponse } from 'communication';
import { catchError, map } from 'rxjs/operators';

export class RealAccountInfoRepository extends BaseRepository<AccountInfo> {
  protected get suffix() {
    return 'Account';
  }

  getItems({ accounts }): Observable<IPaginationResponse<AccountInfo>> {
    return forkJoin(accounts.map(item => {
      return this.getItemById(item.id)
        .pipe(catchError((err) => of(null)));
    })).pipe(
      map((response: AccountInfo[]) => {
        const data = response.filter(item => item);
        return {
          data,
          total: data.length,
        } as IPaginationResponse;
      })
    );
  }

  getItemById(id: number | string): Observable<AccountInfo> {
    const params = this.getApiHeadersByAccount(id);
    return super.getItemById(id, params);
  }
}
