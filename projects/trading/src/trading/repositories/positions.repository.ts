import { Repository } from 'communication';
import { IConnection, IPosition } from 'trading';

export abstract class PositionsRepository extends Repository<IPosition> {
  abstract forConnection(connection: IConnection);
}
