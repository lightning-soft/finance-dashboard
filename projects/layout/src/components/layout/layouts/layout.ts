import { ComponentFactoryResolver, ComponentRef, ElementRef, ViewContainerRef } from '@angular/core';
import { LoadingService } from 'lazy-modules';
import { IDropable } from './dropable';
import { LoaderComponent } from 'ui';

export type ComponentOptions = {
  component: {
    name: string;
    state?: any;
  },
  x?: number | string;
  y?: number | string;
  width?: number;
  height?: number;
  type?: string;
  icon?: string;
  minimizeBtn?: boolean;
  maximizeBtn?: boolean;
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

  abstract addComponent(componentOptions: ComponentOptions);

  handleResize() {

  }

  hasChild(options: ComponentOptions): boolean {
    return false;
  }

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

  abstract getState(): any;

  abstract async loadState(state: any);

  abstract loadEmptyState();
}
