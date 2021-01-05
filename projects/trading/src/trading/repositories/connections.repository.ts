import { Injectable } from '@angular/core';
import { Repository } from 'communication';
import { Observable } from 'rxjs';
import { IConnection } from '../models/connection';

@Injectable()
export abstract class ConnectionsRepository extends Repository<IConnection> {
  abstract connect(item: IConnection): Observable<IConnection>;

  abstract disconnect(item: IConnection): Observable<any>;

  abstract getServers(): Observable<any>;
}
