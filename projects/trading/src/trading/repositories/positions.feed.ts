import { Injectable } from '@angular/core';
import { IPosition } from '../models';
import { Feed } from './feed';

@Injectable()
export abstract class PositionsFeed extends Feed<IPosition>{

}

