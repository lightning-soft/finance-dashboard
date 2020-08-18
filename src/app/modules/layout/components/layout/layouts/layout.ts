import { ComponentFactoryResolver, ComponentRef, ElementRef, ViewContainerRef } from '@angular/core';
import { LoaderComponent } from '../../loader/loader.component';
import { LoadingService } from 'lazy-modules';
import {eventNames} from 'zone.js/lib/browser/property-descriptor';

export abstract class Layout {

  constructor(protected _factoryResolver: ComponentFactoryResolver,
    protected _creationsService: LoadingService,
    protected viewContainer: ViewContainerRef,
    protected container: ElementRef) {

  }

  abstract addComponent(item: string);

  handleResize() {

  }
  createDragSource(element, itemConfig){
  }

  on(eventName: string, callback){
  }

  off(eventName, callback){

  }

  handleEvent(event) {

  }

  getLoaderComponent(): ComponentRef<LoaderComponent> {
    const factory = this._factoryResolver.resolveComponentFactory(LoaderComponent);
    return factory.create(this.viewContainer.injector);
  }

  abstract saveState(): any;

  abstract async loadState(state: any);

  abstract loadEmptyState();
}
