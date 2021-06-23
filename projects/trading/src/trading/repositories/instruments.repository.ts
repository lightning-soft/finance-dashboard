import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { IInstrument } from 'trading';

@Injectable()
export abstract class InstrumentsRepository extends Repository<IInstrument> {
}
