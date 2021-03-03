import { Injectable } from '@angular/core';
import { Bar } from '../models';
import { DataFeed } from './data-feed';

@Injectable()
export abstract class BarDataFeed extends DataFeed<Bar>{
}

