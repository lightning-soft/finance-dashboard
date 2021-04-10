import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { IConnection, ITimezone } from '../models';

@Injectable()
export abstract class TimezonesRepository extends Repository<ITimezone> {
  abstract forConnection(connection: IConnection);
}
