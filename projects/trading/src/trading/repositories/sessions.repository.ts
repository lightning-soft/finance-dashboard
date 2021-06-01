import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { ISession } from '../models';

@Injectable()
export abstract class SessionsRepository extends Repository<ISession> {
}
