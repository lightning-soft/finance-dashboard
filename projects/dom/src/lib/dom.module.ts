import { NgModule } from '@angular/core';
import { DomComponent } from './dom.component';
import { DataGridModule } from 'data-grid';
import { LazyModule, ComponentStore } from 'lazy-modules';
import { WindowHeaderModule } from 'window-header';

@NgModule({
  declarations: [
    DomComponent,
  ],
  imports: [
    DataGridModule,
    WindowHeaderModule,
  ],
  exports: [
    DomComponent,
  ]
})
export class DomModule implements LazyModule {
  get components(): ComponentStore {
    return {
      dom: DomComponent,
    };
  }
}
