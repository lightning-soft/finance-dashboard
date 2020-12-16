import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, Optional, TemplateRef, ViewContainerRef } from '@angular/core';
import { IViewBuilderStore } from './view-builder-store';

@Directive({
  selector: '[itemViewBuilder]'
})
export class ItemViewBuilder implements OnInit {
  private _componentRef: ComponentRef<any>;

  private _item: any;

  @Input()
  set itemViewBuilder(value: any) {
    this._setCell(value);
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    @Optional() private _viewBuilderStore: IViewBuilderStore
  ) { }

  ngOnInit(): void {
    if (!this._item || this._item.component == null) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      return;
    }

    if (!this._viewBuilderStore) {
      console.log('Please Provide View Builder');
      return;
    }

    const component = this._viewBuilderStore.getComponent(this._item.component);

    if (component instanceof Function === false) {
      console.warn(`Please provide ${this._item.component} in view builder store!`);
      return;
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    this._componentRef = this.viewContainerRef.createComponent(componentFactory);
    this._componentRef.instance.cell = this._item;
  }

  private _setCell(value: any) {
    this._item = value;

    if (this._componentRef)
      this._componentRef.instance.cell = this._item;
  }
}
