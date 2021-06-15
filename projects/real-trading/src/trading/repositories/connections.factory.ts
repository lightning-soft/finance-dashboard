import { Inject, Injectable, Injector } from '@angular/core';
import { IConnection } from 'trading';

@Injectable()
export abstract class ConnectionsFactory<T> {
  connection: IConnection;

  constructor(
    @Inject(Injector) protected _injector?: Injector
  ) {
  }

  get(connection: IConnection): T {
    if (!connection) {
      throw new Error(`Please provide valid connection`);
    }

    const key = connection.id;
    const constructor = this.constructor as any;

    if (!constructor.instances) {
      constructor.instances = new Map<IConnection, any>();
      constructor.instancesCounts = new Map<IConnection, number>();
    }

    if (constructor.instances.has(key)) {
      return constructor.instances.get(key);
    }

    const args = constructor.ctorParameters().map((param: any) => this._injector.get(param.type));
    const instance = Reflect.construct(constructor, args);

    instance.connection = connection;
    constructor.instances.set(key, instance);

    return instance;
  }
}
