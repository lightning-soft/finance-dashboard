import { ComponentFactoryResolver, ComponentRef, ElementRef, ViewContainerRef } from '@angular/core';
import { LoadingService } from 'lazy-modules';
import { IDropable } from './dropable';
import { LoaderComponent } from 'ui';
import { IWindow, saveData } from 'window-manager';
import { ILayoutNode } from "../../layout.node";

export type ComponentOptions = {
  component: {
    name: string;
    state?: any;
    template?: any;
  },
  x?: number | string;
  y?: number | string;
  width?: number;
  height?: number;
  type?: string;
  minWidth?: number;
  minHeight?: number;
  icon?: string;
  closableIfPopup?: boolean;
  minimizable?: boolean;
  allowPopup?: boolean;
  maximizable?: boolean;
  hidden?: boolean;
  closeBtn?: boolean;
  resizable?: boolean;
  single?: boolean;
  // used when single set to true
  removeIfExists?: boolean;
};

export abstract class Layout implements IDropable {
  canDragAndDrop = false;

  constructor(
    protected _factoryResolver: ComponentFactoryResolver,
    protected _creationsService: LoadingService,
    protected viewContainer: ViewContainerRef,
    protected container: ElementRef
  ) {
  }

  abstract removeComponents(callback: (item) => boolean);

  abstract addComponent(componentOptions: ComponentOptions | string);

  handleResize() {

  }

  hasChild(options: ComponentOptions): boolean {
    return false;
  }

  abstract findComponent(callback: (item: IWindow) => boolean): IWindow;

  createDragSource(element, component: string) {
  }

  on(eventName: string, callback) {
  }

  off(eventName, callback) {

  }

  handleEvent(event): boolean {
    return false;
  }

  getLoaderComponent(): ComponentRef<LoaderComponent> {
    const factory = this._factoryResolver.resolveComponentFactory(LoaderComponent);
    return factory.create(this.viewContainer.injector);
  }

  abstract getWidgets(): IWindow[];

  abstract getState(): saveData[];

  abstract async loadState(state: any);

  abstract loadEmptyState();
}
