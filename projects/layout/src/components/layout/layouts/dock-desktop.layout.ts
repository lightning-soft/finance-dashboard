import { ComponentFactoryResolver, ElementRef, NgZone, ViewContainerRef } from '@angular/core';
import { LazyLoadingService } from 'lazy-assets';
import { LoadingService } from 'lazy-modules';
import { Options, WindowManagerService } from 'window-manager';
import { EmptyLayout } from '../empty-layout';
import { ComponentOptions, Layout } from './layout';

export class DockDesktopLayout extends Layout {
  canDragAndDrop = true;

  constructor(
    factoryResolver: ComponentFactoryResolver,
    creationsService: LoadingService,
    viewContainer: ViewContainerRef,
    container: ElementRef,
    private _loadingService: LoadingService,
    private _lazyLoadingService: LazyLoadingService,
    private _ngZone: NgZone,
    private _windowManagerService: WindowManagerService,
  ) {
    super(factoryResolver, creationsService, viewContainer, container);
  }

  hasChild(options: ComponentOptions) {
    return this._windowManagerService.windows.getValue()
      .map(item => item.options.componentState())
      .some(item => item.name === options.component.name);
  }


  addComponent(componentNameOrConfig: ComponentOptions | any) {
    let componentName: string;
    let componentState: any;
    let config: any;

    if (typeof componentNameOrConfig === 'string')
      componentName = componentNameOrConfig;
    else {
      const { component, ..._config } = componentNameOrConfig;
      config = _config;
      componentState = component?.state;
      componentName = component?.name;
    }
    if (!this.canAddComponent(componentNameOrConfig)) {
      if (componentNameOrConfig.removeIfExists) {
        const window = this._windowManagerService.windows.getValue().find(item => {
          return item.options.componentState().name === componentName;
        });
        window?.close();
      }
      return;
    }
    // if (componentName === ViewsComponents.Chart && (Environment.browser === Browser.ie || Environment.browser === Browser.edge)) {
    //   // edge don't support obfuscated code StockChartX
    //   // possible solution - add scripts in index.html

    //   this._notifyError('Your browser is not supported this component');
    //   return;
    // }

    try {
      this._ngZone.runOutsideAngular(async () => {
        try {
          const comp = await this._creationsService.getComponentRef(componentName);
          const componentRef = this.viewContainer.insert(comp.hostView);
          const instance: any = comp.instance;

          instance.componentRef = componentRef; // To remove
          instance.layout = this;

          const windowOptions: Options = {
            width: 500,
            height: 500,
            // type: this.getComponentTitle(componentName),
            type: componentName,
            minimizable: true,
            maximizable: true,
            keepInside: {
              top: true,
            },
            ...config,
            componentState: () => ({
              state: instance.saveState && instance.saveState(),
              name: componentName,
            }),
          };

          const window = this._windowManagerService.createWindow(windowOptions);

          if (instance.setLayoutContainer)
            instance.setLayoutContainer(window);

          if (config.hidden)
            instance.minimize();

          if (instance.loadState) {
            instance.loadState(componentState);
          }

          const { _container } = window;

          _container.appendChild(comp.location.nativeElement);
        } catch (e) {
          console.error(e);
          // container.close();
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  private getComponentTitle(componentName: string) {
    return componentName[0].toUpperCase() + componentName.slice(1);
  }

  private canAddComponent(options: ComponentOptions) {
    if (!options.single) {
      return true;
    }
    return !this.hasChild(options);
  }

  createDragSource(element, component) {
    const config = {
      title: component.capitalize(),
      type: 'component',
      componentName: component,
    };

    // this.goldenLayout.createDragSource(element, config);
  }

  on(eventName: string, callback) {
    // this.goldenLayout.on(eventName, callback);
  }

  off(eventName: string, callback) {
    // this.goldenLayout.off(eventName, callback);
  }

  handleResize() {
    super.handleResize();
    // if (this.goldenLayout) {
    //   this.goldenLayout.updateSize();
    // }
  }

  handleEvent(event) {
    const activeWindow = this._windowManagerService.activeWindow;

    return activeWindow && activeWindow.emit('event', event);
  }

  _load(config: any[]) {
    if (!Array.isArray(config))
      return;

    for (let i = config.length - 1; i >= 0; i--) {
      this.addComponent(config[i]);
    }
  }

  async loadState(config: any) {
    this._tryDestroy();
    await this._lazyLoadingService.load();

    try {
      // if (!this.dockManager) {
      //   // const manager = new WindowManager({
      //   //   parent: this.container.nativeElement,
      //   //   backgroundWindow: 'grey',
      //   // });

      //   // // manager.snap({ spacing: 1 });

      //   // this.dockManager = manager;
      //   // (window as any).dockManager = manager;
      //   // (window as any).wm = manager;
      // }

      if (config)
        this._load(config);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getState(): any {
    return this._windowManagerService.saveState();
  }

  _tryDestroy() {

  }

  loadEmptyState() {
    this.loadState(EmptyLayout);
  }
}
