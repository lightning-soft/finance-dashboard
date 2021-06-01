import { Injectable } from '@angular/core';
import { AccountNodeComponent } from 'accounts-manager';
import { Observable } from 'rxjs';
import { IConnection } from 'trading';

@Injectable()
export abstract class AccountsManager {
  abstract get(node: AccountNodeComponent): AccountsManager;

  abstract connections$: Observable<IConnection[]>;
  abstract activeConnection$: Observable<IConnection>;

  abstract get connections(): IConnection;
  abstract get activeConnection(): IConnection;

  abstract init(): Promise<IConnection[]>;

  abstract getConnectedConnections(): IConnection[];
  abstract createConnection(connection: IConnection): Observable<IConnection>;
  abstract rename(name: string, connection: IConnection): Observable<IConnection>;
  abstract connect(connection: IConnection): Observable<IConnection>;
  abstract disconnect(connection: IConnection): Observable<void>;
  abstract deleteConnection(connection: IConnection): Observable<any>;
  abstract toggleFavourite(connection: IConnection): Observable<IConnection>;
}
