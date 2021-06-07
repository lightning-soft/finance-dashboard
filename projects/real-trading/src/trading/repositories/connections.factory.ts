import { Injectable, Injector } from '@angular/core';
import { IConnection } from 'trading';

@Injectable()
export abstract class ConnectionsFactory {
  isSingleton = true;
  connection: IConnection;

  protected _injector?: Injector;

  constructor(
    // @Optional() @Inject(Injector) protected _injector?: Injector
  ) {
    console.log(this.constructor.name, this._injector)
  }

  get(connection: IConnection): any {
    if (!connection) {
      return this;
    }

    // const key = connection.id;
    // const constructor = this.constructor as any;

    // if (this.isSingleton) {
    //   if (!constructor.instances) {
    //     constructor.instances = new Map<IConnection, any>();
    //     constructor.instancesCounts = new Map<IConnection, number>();
    //   } else if (constructor.instances.has(key)) {
    //     return constructor.instances.get(key);
    //   }
    // }

    // const args = constructor.ctorParameters().map((param: any) => this._injector.get(param.type));
    // const instance: ConnectionsFactory = Reflect.construct(constructor,? args);

    // instance.connection = connection;

    // if (this.isSingleton) {
    //   const count = (constructor.instancesCounts.get(key) ?? 0) + 1;

    //   constructor.instances.set(key, instance);
    //   constructor.instancesCounts.set(key, count);
    // }

    return this;
  }
}
