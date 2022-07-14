import {ComponentFactoryResolver, ElementRef, NgZone, ViewContainerRef} from '@angular/core';
import {LazyLoadingService} from 'lazy-assets';
import {LoadingService} from 'lazy-modules';
import {IWindow, Options, saveData, WindowManagerService} from 'window-manager';
import {EmptyLayout} from '../empty-layout';
import {ComponentOptions, Layout} from './layout';
import {IBaseTemplate} from "templates";
import {Components} from "../../../../../../src/app/modules";

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
      .filter(item => {
        return item.visible;
      })
      .map(item => item.options.componentState())
      .some(item => item.name === options.component.name);
  }

  findComponent(callback: (item: IWindow) => boolean): IWindow {
    return this._windowManagerService.windows.getValue()
      .find(callback);
  }

  removeComponents(callback: (item) => boolean) {
    this._windowManagerService.windows.getValue()
      .forEach(item => {
        if (callback(item))
          item.close();
      });
  }

  getWidgets() {
    return this._windowManagerService.windows.getValue().slice();
  }

  async addComponent(componentNameOrConfig: ComponentOptions | any): Promise<boolean> {
    let componentName: string;
    let componentState: any;
    let componentTemplate: IBaseTemplate;
    let config: any;

    if (typeof componentNameOrConfig === 'string') {
      componentName = componentNameOrConfig;
      config = {};
    } else {
      const {component, ..._config} = componentNameOrConfig;
      config = _config;
      componentState = component?.state;
      componentTemplate = component?.template;
      componentName = component?.name;
    }
    if (!this.canAddComponent(componentNameOrConfig)) {
      const window = this._windowManagerService.windows.getValue()
        .find(item => item.options.componentState().name === componentName);

      if (componentNameOrConfig.removeIfExists) {
        window?.close();
      } else {
        window?.focus();
      }

      return;
    }
    // if (componentName === ViewsComponents.Chart && (Environment.browser === Browser.ie || Environment.browser === Browser.edge)) {
    //   // edge don't support obfuscated code StockChartX
    //   // possible solution - add scripts in index.html

    //   this._notifyError('Your browser is not supported this component');
    //   return;
    // }
    let window;
    let comp;

    try {
      comp = await this._creationsService.getComponentRef(componentName);
      const componentRef = this.viewContainer.insert(comp.hostView);
      const instance: any = comp.instance;

      instance.componentRef = componentRef; // To remove
      instance.layout = this;
      let configData = {
        width: 500,
        allowPopup: true,
        height: 500,
        visible: true,
        minWidth: 320,
        minHeight: 150,
        ...config
      };
      if (configData.minHeight > configData.height) {
        configData.height = configData.minHeight;
      }
      if (configData.minWidth > configData.width) {
        configData.width = configData.minWidth;
      }

      switch (componentName) {
        case Components.Dom:
          configData = {...configData, width: 650, height: 950};
          break;
        default:
          break;
      }

      const windowOptions: Options = {
        // type: this.getComponentTitle(componentName),
        type: componentName,
        // minimizable: true,
        minHeight: config.minHeight,
        minWidth: config.minWidth,
        // maximizable: true,
        keepInside: {
          top: true,
          left: true,
        },
        ...configData,
        ...componentTemplate?.tabState,
        componentState: () => ({
          state: instance.saveState && instance.saveState(),
          name: componentName,
        }),
      };

      window = this._windowManagerService.createWindow(windowOptions);

      if (instance.setLayoutContainer)
        instance.setLayoutContainer(window);

      if (config.hidden)
        instance.minimize();

      if (componentTemplate && instance.loadTemplate) {
        instance.loadTemplate(componentTemplate);
      } else if (instance.loadState) {
        instance.loadState(componentState);
      }

      const {_container} = window;

      _container.appendChild(comp.location.nativeElement);
    } catch (e) {
      console.error('Create component', e);

      if (window)
        window.close();

      const index = this.viewContainer.indexOf(comp.hostView);
      if (index !== -1)
        this.viewContainer.remove();

      return false;
    }

    return true;
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

  async _load(config: any[]) {
    if (!Array.isArray(config))
      return;

    const widgets = this.getWidgets();
    const promises = [];
    for (let i = config.length - 1; i >= 0; i--) {
      const widget = widgets.find(item => item.id === config[i].id);
      if (widget) {
        widget.visible = true;
      } else {
        const index = i;
        promises.push(this.addComponent(config[index]).then(result => {
          if (result === false) {
            config.splice(index, 1);
          }
        }));
      }
    }
    await Promise.all(promises);

    this._windowManagerService.updateWindows();
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

      await this._load(config);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getState(): saveData[] {
    return this._windowManagerService.saveState();
  }

  _tryDestroy() {

  }

  loadEmptyState() {
    this.loadState(EmptyLayout);
  }
}
