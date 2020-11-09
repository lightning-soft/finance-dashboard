import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { IBroker } from 'trading';

@Injectable()
export abstract class ConnectionsRepository extends Repository<IBroker> {
}
