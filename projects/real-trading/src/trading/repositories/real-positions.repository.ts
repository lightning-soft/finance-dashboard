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
}
