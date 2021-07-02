import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { IInstrument } from 'trading';
import { Observable } from 'rxjs';

@Injectable()
export abstract class InstrumentsRepository extends Repository<IInstrument> {

  abstract rollInstrument(instrument: IInstrument, params): Observable<IInstrument>;
}
