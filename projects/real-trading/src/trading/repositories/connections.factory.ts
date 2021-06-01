import { Injectable, Injector } from '@angular/core';
import { IConnection } from 'trading';

export abstract class ConnectionDepNode {
  connection: IConnection;

  initConnectionDeps() {
    this._forEachConnectionDep((dep, key) => {
      this[key] = dep.get(this.connection);
    });
  }

  destroyConnectionDeps() {
    this._forEachConnectionDep((dep) => {
      dep.destroy(this.connection);
    });
  }

  private _forEachConnectionDep(callback: (dep: ConnectionsFactory, key: string) => void) {
    Object.keys(this).forEach(key => {
      if (this[key] instanceof ConnectionsFactory) {
        callback(this[key], key);
      }
    });
  }
}

@Injectable()
export abstract class ConnectionsFactory extends ConnectionDepNode {
  isSingleton = true;

  protected _injector: Injector;

  get(connection: IConnection): any {
    if (!connection) {
      return this;
    }

    const key = connection.id;
    const constructor = this.constructor as any;

    if (this.isSingleton) {
      if (!constructor.instances) {
        constructor.instances = new Map<IConnection, any>();
        constructor.instancesCounts = new Map<IConnection, number>();
      } else if (constructor.instances.has(key)) {
        return constructor.instances.get(key);
      }
    }

    const args = constructor.ctorParameters().map((param: any) => this._injector.get(param.type));
    const instance: ConnectionsFactory = Reflect.construct(constructor, args);

    instance.connection = connection;
    instance.initConnectionDeps();

    if (this.isSingleton) {
      const count = (constructor.instancesCounts.get(key) ?? 0) + 1;

      constructor.instances.set(key, instance);
      constructor.instancesCounts.set(key, count);
    }

    return instance;
  }

  destroy(connection: IConnection) {
    const { instances, instancesCounts } = this.constructor as any;

    if (!connection || !instances?.has(connection.id)) {
      return;
    }

    const key = connection.id;
    const count = (instancesCounts.get(key) ?? 0) - 1;

    if (count > 0) {
      instancesCounts.set(key, count);
      return;
    }

    instances.delete(key);
    instancesCounts.delete(key);
  }
}
