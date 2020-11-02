import { Observable, Subscription } from 'rxjs';

export abstract class Broker {
  abstract handleConnection(callback: (isConnected: boolean) => void, instance?: any): Subscription;

  abstract connect(login: string, password: string): Observable<any>;

  abstract disconnect(): Observable<any>;
}
