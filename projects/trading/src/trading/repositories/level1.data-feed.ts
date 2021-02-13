import { Injectable } from '@angular/core';
import { IQuote } from '../models/';
import { DataFeed } from './data-feed';

@Injectable()
export abstract class Level1DataFeed extends DataFeed<IQuote> {
}

