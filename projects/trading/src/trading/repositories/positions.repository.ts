import { Repository } from 'communication';
import { IConnection, IPosition } from 'trading';
import { Observable } from 'rxjs';

export interface IDeletePositionsParams {
  accountId: string;
  symbol: string;
  exchange: string;
}
export abstract class PositionsRepository extends Repository<IPosition> {
  abstract forConnection(connection: IConnection);
  abstract deleteMany(params: IDeletePositionsParams): Observable<any>;
}
