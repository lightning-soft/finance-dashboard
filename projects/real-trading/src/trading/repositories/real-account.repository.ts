import { IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccountRepository, IAccount } from 'trading';
import { BaseRepository } from './base-repository';

export class RealAccountRepository extends BaseRepository<IAccount> implements AccountRepository {
  protected get suffix(): string {
    return 'Account';
  }

  _getRepository() {
    return new RealAccountRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItems(params = {}): Observable<IPaginationResponse<IAccount>> {
    return super.getItems(params).pipe(
      map((res: any) => {
        return { data: res.result, } as IPaginationResponse<IAccount>;
      }),
    );
  }
}
