import { ComponentFactoryResolver, ElementRef, NgZone, ViewContainerRef } from '@angular/core';
import { LazyLoadingService } from 'lazy-assets';
import { LoadingService } from 'lazy-modules';
import { EmptyLayout } from '../empty-layout';
import { ComponentOptions, Layout } from './layout';
import { WindowManager } from 'simple-window-manager';

export class DockDesktopLayout extends Layout {
  canDragAndDrop = true;

  dockManager: any;

  constructor(
    factoryResolver: ComponentFactoryResolver,
    creationsService: LoadingService,
    viewContainer: ViewContainerRef,
    container: ElementRef,
    private _lazyLoadingService: LazyLoadingService,
    private _ngZone: NgZone
  ) {
    super(factoryResolver, creationsService, viewContainer, container);
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

    // if (componentName === ViewsComponents.Chart && (Environment.browser === Browser.ie || Environment.browser === Browser.edge)) {
    //   // edge don't support obfuscated code StockChartX
    //   // possible solution - add scripts in index.html

    //   this._notifyError('Your browser is not supported this component');
    //   return;
    // }


    try {
      this._ngZone.run(async () => {
        try {
          const comp = await this._creationsService.getComponentRef(componentName);
          const componentRef = this.viewContainer.insert(comp.hostView);
          const instance: any = comp.instance;

          instance.componentRef = componentRef;
          // instance.link = componentState.link || 0;

          // const linkSelect = await this.getLinkSelect(container, instance);

          // TMP icon
          let frameManager;

          let maximizeButton;
          let maximizable = false;

          // if (componentOptions.type === 'widget') {
          //   frameManager = document.createElement('i');
          //   frameManager.className = `icon-widget-${componentName}`;

          maximizeButton = '<i class="icon-full-screen-window"></i>';
          maximizable = true;
          // } else if (componentOptions.icon) {
          //   frameManager = document.createElement('i');
          //   frameManager.className = componentOptions.icon;
          // }

          const restoreButton = '<i class="icon-maximize-window"></i>';
          const closeButton = '<i class="icon-close-window"></i>';

          // const winClassName = componentOptions.type;

          const windowOptions = {
            width: 500,
            height: 500,
            title: componentName[0].toUpperCase() + componentName.slice(1),
            frameManager,
            // classNames: { win: winClassName },
            minimizable: true,
            maximizable,
            restoreButton,
            maximizeButton,
            minimizeButton: '',
            closeButton,
            y: 70,
            x: 50,
            ...config,
            componentState: () => ({
              state: instance.getState && instance.getState(),
              name: componentName,
            }),
          }

          const window = this.dockManager.createWindow(windowOptions);

          if (instance.setLayoutContainer)
            instance.setLayoutContainer(window);

          if (instance.loadState && componentState) {
            instance.loadState(componentState);
          }

          window.content.appendChild(comp.location.nativeElement);
        } catch (e) {
          console.error(e);
          // container.close();
        }
      });
    } catch (e) {
      console.log(e);
    }
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
    // super.handleEvent(event);
    // const goldenLayout = this.goldenLayout;
    // if (!this.goldenLayout) {
    //   return;
    // }

    // if (!goldenLayout.selectedItem) {
    //   goldenLayout.selectItem(goldenLayout.root && goldenLayout.root.contentItems && goldenLayout.root.contentItems[0]);
    // }

    // const item = goldenLayout.selectedItem;
    // const activeItem: any = item && item.getActiveContentItem ? item.getActiveContentItem() : item;

    // if (activeItem && activeItem.container) {
    //   activeItem.container.emit('event', event);
    // }
  }

  _load(config: any[]) {
    if (!Array.isArray(config))
      return;

    for (const item of config) {
      this.addComponent(item);
    }
  }

  async loadState(config: any) {
    this._tryDestroy();
    await this._lazyLoadingService.load();

    try {
      if (!this.dockManager) {
        const manager = new WindowManager({
          parent: this.container.nativeElement,
          backgroundWindow: 'grey',
        });

        manager.snap({ spacing: 1 });

        this.dockManager = manager;
        (window as any).dockManager = manager;
        (window as any).wm = manager;
      }

      if (config)
        this._load(config);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getState(): any {
    return this.dockManager.save();
  }

  _tryDestroy() {

  }

  loadEmptyState() {
    this.loadState(EmptyLayout);
  }
}
