import { Injectable } from '@angular/core';
import { IInstrument } from 'trading';
import { Feed } from './feed';

@Injectable()
export abstract class DataFeed<T> extends Feed<T>{
  abstract subscribe(instrument: IInstrument);

  abstract unsubscribe(instrument: IInstrument);
}

