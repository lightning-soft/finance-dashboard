import { Id, Repository } from 'communication';
import { Observable } from 'rxjs';
import { IPosition } from 'trading';

export interface IDeletePositionsParams {
  accountId: Id;
  symbol: string;
  exchange: string;
}

export interface IInstrumentParams {
  accountId: string;
}

export abstract class PositionsRepository extends Repository<IPosition> {
  abstract deleteMany(params: IDeletePositionsParams): Observable<any>;
}
