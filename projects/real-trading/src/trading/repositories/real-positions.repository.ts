import { IPaginationResponse } from 'communication';
import { map } from 'rxjs/operators';
import { IPosition } from 'trading';
import { BaseRepository } from './base-repository';

export class RealPositionsRepository extends BaseRepository<IPosition> {
  protected get suffix(): string {
    return 'Position';
  }

  _getRepository() {
    return new RealPositionsRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItems(params) {
    params.id = params.accountId;
    delete params.accountId;
    return super.getItems(params).pipe(
      map((res: any) => ({ data: res.result } as IPaginationResponse<IPosition>)),
    );
  }
}
