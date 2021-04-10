import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { IConnection, ISession } from '../models';

@Injectable()
export abstract class SessionsRepository extends Repository<ISession> {
  abstract forConnection(connection: IConnection);
}
