import { Injectable } from '@angular/core';
import { IOrder } from 'trading';
import { Feed } from './feed';

@Injectable()
export abstract class OrdersFeed extends Feed<IOrder>{

}

