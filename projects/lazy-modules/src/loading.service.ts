import {
  Compiler,
  ComponentFactory,
  ComponentRef,
  Injectable,
  Injector,
  NgModuleFactory,
  NgModuleRef,
  InjectionToken,
  Inject,
  Type,
  ComponentFactoryResolver,
  ApplicationRef,
  EmbeddedViewRef,
  StaticProvider,
} from '@angular/core';
import { LoadChildrenCallback, Router } from '@angular/router';
import { IModules } from './models';

export abstract class LayoutNodeProvider {
  component: Type<any>;
}

export const ModulesStoreToken = new InjectionToken<IModules[]>('ModulesToken');

@Injectable()
export class LoadingService {
  private store: { [path: string]: NgModuleRef<any> } = {};

  constructor(
    @Inject(ModulesStoreToken) private _modules: IModules[],
    private router: Router,
    private _compiler: Compiler,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private readonly injector: Injector,
  ) { }

  private async _getModuleRef(modulePath: string): Promise<NgModuleRef<any>> {
    if (this.store[modulePath] == null) {
      const config = this.router.config.find(({ path }) => path == modulePath);

      if (!config || typeof config.loadChildren != 'function')
        throw new Error(`Please register ${modulePath} routes in router`);

      const factory = await ((config.loadChildren as LoadChildrenCallback)() as any)
        .then(module => module instanceof NgModuleFactory ? module : this._compiler.compileModuleAsync(module));

      this.store[modulePath] = factory.create(this.injector);
    }

    return this.store[modulePath];
  }

  private _getRef(name: string) {
    const item = this._modules.find(i => i.components.some(component => component == name));

    if (!item)
      throw new Error(`Can\'t find module for ${name} component`);

    return this._getModuleRef(item.module);
  }

  // async getComponentFactory<T = any>(name: string): Promise<ComponentFactory<T>> {
  //   const moduleRef = await this._getRef(name);
  //   const module = moduleRef.instance;
  //   const componentsStore = module.components;
  //   const entryComponent = componentsStore && componentsStore[name];

  //   if (!entryComponent)
  //     throw new Error(`${name} should to been registered`);

  //   return moduleRef.componentFactoryResolver.resolveComponentFactory<T>(entryComponent);
  // }

  async getComponentRef<T = any>(name: string): Promise<ComponentRef<T>> {
    const moduleRef = await this._getRef(name);
    const module = moduleRef.instance;
    const componentsStore = module.components;
    const component = componentsStore && componentsStore[name];

    if (!component)
      throw new Error(`${name} should to been registered`);

    let compFactory = moduleRef.componentFactoryResolver.resolveComponentFactory<T>(component);

    return compFactory.create(Injector.create({
      providers: [
        {
          provide: LayoutNodeProvider,
          useValue: { component },
        }
      ],
    }));
  }

  async getDynamicComponent(
    componentType: Type<any>,
    providers: StaticProvider[] = [],
  ): Promise<any> {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(componentType)
      .create(Injector.create({
        providers,
        parent: this.injector,
      }));

    this.appRef.attachView(componentRef.hostView);

    const domElement = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    return {
      ref: componentRef,
      domElement,
      destroy: () => {
        componentRef.destroy();

        this.appRef.detachView(componentRef.hostView);
      },
    };
  }
}

export class DynamicComponentConfig<D = any> {
  data?: D;
}
