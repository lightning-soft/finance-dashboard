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

  addComponent(componentOptions: ComponentOptions) {

    const componentName = componentOptions.name;
    // if (componentName === ViewsComponents.Chart && (Environment.browser === Browser.ie || Environment.browser === Browser.edge)) {
    //   // edge don't support obfuscated code StockChartX
    //   // possible solution - add scripts in index.html

    //   this._notifyError('Your browser is not supported this component');
    //   return;
    // }

    // if (!this.goldenLayout) {
    //   this._notifyError('Sorry, something went wrong. Try reloading the page');
    //   console.error('Please init golden layout');
    //   return;
    // }

    // const goldenLayout = this.goldenLayout;
    // const content = goldenLayout.selectedItem || goldenLayout.root.contentItems[0];
    // const item = {
    //   type: 'component',
    //   componentName,
    //   componentState: null
    // };

    try {
      // if (content) {
      //   content.addChild(item);
      // } else {
      //   goldenLayout.root.addChild(item);
      // }

      // let infovis = new PanelContainer(document.getElementsByClassName("name")[0], this.dockManager);

      this._ngZone.run(async () => {
        try {
          // const loader = this.getLoaderComponent();
          // this.viewContainer.insert(loader.hostView);

          // container
          //   .getElement()
          //   .append($(loader.location.nativeElement));

          const comp = await this._creationsService.getComponentRef(componentName);
          const componentRef = this.viewContainer.insert(comp.hostView);
          // this.viewContainer.remove
          const instance: any = comp.instance;

          // container
          //   .getElement()
          //   .append($(comp.location.nativeElement));

          instance.componentRef = componentRef;

          // if (instance.loadState) {
          //   instance.loadState(componentState.component);
          // }

          // instance.link = componentState.link || 0;

          // const linkSelect = await this.getLinkSelect(container, instance);

          // TMP icon
          let frameManager;

          let maximizeButton;
          let maximizable = false;

          if (componentOptions.type === 'widget') {
            frameManager = document.createElement('i');
            frameManager.className = `icon-widget-${componentName}`;

            maximizeButton = '<i class="icon-full-screen-window"></i>';
            maximizable = true;
          } else if (componentOptions.icon) {
            frameManager = document.createElement('i');
            frameManager.className = componentOptions.icon;
          }

          const restoreButton = '<i class="icon-maximize-window"></i>';
          const closeButton = '<i class="icon-close-window"></i>';

          const winClassName = componentOptions.type;

          const windowOptions = {
            width: 500,
            height: 500,
            title: componentName[0].toUpperCase() + componentName.slice(1),
            frameManager,
            classNames: { win: winClassName },
            minimizable: true,
            maximizable,
            restoreButton,
            maximizeButton,
            minimizeButton: '',
            closeButton,
            y: 70,
            x: 50,
          };

          const window = this.dockManager.createWindow(windowOptions);

          if (instance.setLayoutContainer)
            instance.setLayoutContainer(window);

          window.content.appendChild(comp.location.nativeElement);

          // set content of window
          // window.content.style.margin = '10px';
          // window.content.innerHTML = 'This is a nifty window.';

          // const setLinkSelect = () => {
          //   container.tab.element[0].prepend(linkSelect);
          // };

          // container.on('tab', setLinkSelect);

          // if (container.tab) {
          //   setLinkSelect();
          // }

          // container.on('tab', tab => {
          //   this._addMobileTabDraggingSupport(tab);
          // });

          // this._addMobileTabDraggingSupport(container.tab);

          // loader.destroy();
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


  async loadState(config: any) {
    this._tryDestroy();
    await this._lazyLoadingService.load();

    try {
      const nativeElement = this.container.nativeElement;
      const content = new WindowManager({
        parent: nativeElement,
        backgroundWindow: 'grey',
      });
      content.snap({ spacing: 3 });

      this.dockManager = content;
      (window as any).dockManager = content;
      (window as any).wm = content;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getState(): any {
  }

  _tryDestroy() {

  }

  loadEmptyState() {
    this.loadState(EmptyLayout);
  }
}
