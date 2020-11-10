import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { IBroker } from 'trading';

@Injectable()
export abstract class BrokersRepository extends Repository<IBroker> {

}
