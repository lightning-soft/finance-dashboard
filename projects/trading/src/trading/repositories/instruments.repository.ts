import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { IInstrument } from 'trading';
import { IConnection } from '../models/connection';

@Injectable()
export abstract class InstrumentsRepository extends Repository<IInstrument> {
  abstract forConnection(connection: IConnection);
}
