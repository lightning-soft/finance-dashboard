import {ComponentFactoryResolver, ComponentRef, ElementRef, ViewContainerRef} from '@angular/core';


export abstract class Layout {

  constructor(protected factoryResolver: ComponentFactoryResolver,
              protected viewContainer: ViewContainerRef,
              protected container: ElementRef

  ) {

  }

  abstract addComponent(item: string);

  handleResize() {

  }

  handleEvent(event) {

  }



  abstract saveState(): any;

  abstract async loadState(state: any);

  abstract loadEmptyState();
}
