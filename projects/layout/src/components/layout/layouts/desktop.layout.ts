import { ComponentFactoryResolver, ElementRef, NgZone, ViewContainerRef } from '@angular/core';
import { LazyLoadingService } from 'lazy-assets';
import { DynamicComponentConfig, LoadingService } from 'lazy-modules';
import { LinkSelectComponent } from '../../link-select/link-select.component';
import { EmptyLayout } from '../empty-layout';
import { ComponentInitCallback } from '../layout.component';
import { Layout } from './layout';
import { IWindow } from 'window-manager';

const DragTabClass = 'drag-tab-class';

export class DesktopLayout extends Layout {
  goldenLayout: GoldenLayout;
  canDragAndDrop = true;
  private _linkSelectMap: Map<GoldenLayout.Container, HTMLElement> = new Map();

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

  // TODO implement
  removeComponents(callback) {
  }

  // #TODO implement
  findComponent(callback: (item: IWindow) => boolean): IWindow {
    throw new Error('Not implemented');
  }


  addComponent(componentName: string) {
    // if (componentName === ViewsComponents.Chart && (Environment.browser === Browser.ie || Environment.browser === Browser.edge)) {
    //   // edge don't support obfuscated code StockChartX
    //   // possible solution - add scripts in index.html

    //   this._notifyError('Your browser is not supported this component');
    //   return;
    // }

    if (!this.goldenLayout) {
      this._notifyError('Sorry, something went wrong. Try reloading the page');
      console.error('Please init golden layout');
      return;
    }

    const goldenLayout = this.goldenLayout;
    const content = goldenLayout.selectedItem || goldenLayout.root.contentItems[0];
    const item = {
      type: 'component',
      componentName,
      componentState: null
    };

    try {
      if (content) {
        content.addChild(item);
      } else {
        goldenLayout.root.addChild(item);
      }
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

    this.goldenLayout.createDragSource(element, config);
  }

  on(eventName: string, callback) {
    this.goldenLayout.on(eventName, callback);
  }

  off(eventName: string, callback) {
    this.goldenLayout.off(eventName, callback);
  }

  handleResize() {
    super.handleResize();
    if (this.goldenLayout) {
      this.goldenLayout.updateSize();
    }
  }

  handleEvent(event) {
    super.handleEvent(event);
    const goldenLayout = this.goldenLayout;
    if (!this.goldenLayout) {
      return;
    }

    if (!goldenLayout.selectedItem) {
      goldenLayout.selectItem(goldenLayout.root && goldenLayout.root.contentItems && goldenLayout.root.contentItems[0]);
    }

    const item = goldenLayout.selectedItem;
    const activeItem: any = item && item.getActiveContentItem ? item.getActiveContentItem() : item;

    if (activeItem && activeItem.container) {
      activeItem.container.emit('event', event);
    }
  }

  createComponentInitCallback(name: string): ComponentInitCallback {
    return async (container: GoldenLayout.Container, componentState: any) => {
      this._ngZone.run(async () => {
        try {
          const loader = this.getLoaderComponent();
          this.viewContainer.insert(loader.hostView);

          container
            .getElement()
            .append($(loader.location.nativeElement));

          const comp = await this._creationsService.getComponentRef(name);
          const componentRef = this.viewContainer.insert(comp.hostView);
          const instance: any = comp.instance;

          container
            .getElement()
            .append($(comp.location.nativeElement));

          instance.componentRef = componentRef;

          if (instance.setLayoutContainer)
            instance.setLayoutContainer(container);

          if (instance.loadState) {
            instance.loadState(componentState.component);
          }

          instance.link = componentState.link || 0;

          const linkSelect = await this.getLinkSelect(container, instance);

          const setLinkSelect = () => {
            container.tab.element[0].prepend(linkSelect);
          };

          container.on('tab', setLinkSelect);

          if (container.tab) {
            setLinkSelect();
          }

          container.on('tab', tab => {
            this._addMobileTabDraggingSupport(tab);
          });

          this._addMobileTabDraggingSupport(container.tab);

          loader.destroy();
        } catch (e) {
          console.error(e);
          container.close();
        }
      });
    };
  }

  async loadState(config: any) {
    this._tryDestroy();
    await this._lazyLoadingService.load();

    try {
      const goldenLayout = new GoldenLayout(config, $(this.container.nativeElement));

      goldenLayout.getComponent = (name) => {
        return this.createComponentInitCallback(name);
      };

      // Register all goldenlayout components.
      // this.glService.initialize(this.goldenLayout, this);

      // Initialize the layout.
      goldenLayout.init();
      this.goldenLayout = goldenLayout;
      (window as any).goldenLayout = goldenLayout;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getWidgets() {
    // implement
    return [];
  }

  getState(): any {
    if (!this.goldenLayout || !this.goldenLayout.root) {
      return;
    }

    this.extendState(this.goldenLayout.root.contentItems);
    return this.goldenLayout.toConfig();
  }

  extendState(items: GoldenLayout.ContentItem[]) {
    if (!items || !items.length) {
      return;
    }

    for (const item of items) {
      if (item.isComponent && (item as any).container.trigger) {
        (item as any).container.trigger('extendState');
      }

      this.extendState(item.contentItems);
    }
  }

  _tryDestroy() {
    if (this.goldenLayout && this.goldenLayout.isInitialised) {
      this.goldenLayout.destroy();
    }
  }

  loadEmptyState() {
    this.loadState(EmptyLayout);
  }

  async getLinkSelect(container: GoldenLayout.Container, instance: any) {
    if (this._linkSelectMap.has(container)) {
      return this._linkSelectMap.get(container);
    }

    const { ref, domElement, destroy } = await this._creationsService
      .getDynamicComponent(LinkSelectComponent, [{
        provide: DynamicComponentConfig,
        useValue: {
          data: {
            value: instance.link,
          },
        },
      }]);

    this._linkSelectMap.set(container, domElement);

    const subscription = ref.instance.handleChange.subscribe((link: number) => {
      instance.link = link;
    });

    container.on('destroy', () => {
      this._linkSelectMap.delete(container);

      subscription.unsubscribe();

      destroy();
    });

    return domElement;
  }

  private _addMobileTabDraggingSupport(tab: GoldenLayout.Tab) {
    /*
    * https://developer.mozilla.org/en-US/docs/Web/API/Touch/target
    *
    * If touchstart event target removed from DOM, then touchmove event won't be fired
    *
    * Solution: add overlay element to each tab, that will be replaced from tab container to body when touchstart
    * event will be fired
    *
    *
    * */

    if (!tab) {
      return;
    }

    const tabDrag = $(`<span class="${DragTabClass}"></span>`);
    tabDrag.css({
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      'z-index': 1
    });

    $(tab.element).append(tabDrag);
    this._overrideTabOnDragStart(tab);
  }

  private _overrideTabOnDragStart(tab: any) {
    const origin = tab._onDragStart;
    const dragListener = tab._dragListener;
    const dragElement = $(tab.element).find(`.${DragTabClass}`);

    dragListener.off('dragStart', origin, tab);
    const onDragStart = function (x, y) {
      dragElement.appendTo('body');
      origin.call(tab, x, y);
    };

    tab._onDragStart = onDragStart;
    dragListener.on('dragStart', (tab as any)._onDragStart, tab);
    dragListener.on('dragStop', () => {
      dragElement.remove();
    }, null);
  }

  private _notifyError(err) {
    return err;
  }
}
