import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { ITimezone } from '../models';

@Injectable()
export abstract class TimezonesRepository extends Repository<ITimezone> {
}
