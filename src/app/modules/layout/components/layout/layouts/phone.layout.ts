// import {Layout} from './layout';
// import {ComponentRef} from '@angular/core';
// import {LayoutNode} from 'layout';

// interface MobileLayoutState {
//   state: { [name: string]: string };
//   activeComponent: string;
// }

// export class PhoneLayout extends Layout {
//   private _componentRef: ComponentRef<LayoutNode>;

//   private _state: { [name: string]: string } = {};

//   private _activeComponent: string;

//   addComponent(name: string) {
//     if (this._activeComponent)
//       this._state[this._activeComponent] = this._componentRef && this._componentRef.instance.saveState();

//     this._addComponent(name, this._state[name]);
//   }

//   loadEmptyState() {
//     if (!this._componentRef)
//       return;

//     this._componentRef.destroy();
//     this._componentRef = null;
//   }

//   loadState(state: MobileLayoutState) {
//     if (!state)
//       return;

//     this._state = state.state || {};
//     this.addComponent(state.activeComponent);
//   }

//   getState(): MobileLayoutState {
//     if (this._activeComponent && this._componentRef && this._componentRef.instance)
//       this._state[this._activeComponent] = this._componentRef.instance.saveState();

//     return {
//       state: this._state,
//       activeComponent: this._activeComponent
//     };
//   }

//   createDragSource(element, itemConfig) {
//   }

//   handleResize() {
//     if (this._componentRef && this._componentRef.instance)
//       this._componentRef.instance.handleResize();
//   }

//   private async _addComponent(name: string, state: any) {
//     if (!name)
//       return;

//     const loader = this.getLoaderComponent();

//     if (loader)
//       this.viewContainer.insert(loader.hostView);

//     let component = await this._creationsService.getComponentRef(name),
//       viewContainer = this.viewContainer,
//       instance: any = component.instance,
//       nativeElement = viewContainer && viewContainer.element && viewContainer.element.nativeElement;

//     if (nativeElement)
//       nativeElement.style.display = 'none';

//     if (this._componentRef)
//       this._componentRef.destroy();

//     this.viewContainer.insert(component.hostView);
//     this._activeComponent = name;
//     this._componentRef = component;

//     if (instance.loadState)
//       instance.loadState(state);

//     if (loader)
//       loader.destroy();
//   }
// }
