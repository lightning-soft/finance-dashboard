import { Id, Repository } from 'communication';
import { IPosition } from 'trading';
import { Observable } from 'rxjs';

export interface IDeletePositionsParams {
  accountId: Id;
  symbol: string;
  exchange: string;
}
export abstract class PositionsRepository extends Repository<IPosition> {
  abstract deleteMany(params: IDeletePositionsParams): Observable<any>;
}
