import { Injectable } from '@angular/core';
import { Id } from 'communication';
import { IInstrument } from 'trading';
import { Feed } from './feed';

@Injectable()
export abstract class DataFeed<T> extends Feed<T>{
  abstract subscribe(instrument: IInstrument, connectionId?: Id);
  // TDDO: remove optional
  abstract unsubscribe(instrument: IInstrument, connectionId?: Id);
}

