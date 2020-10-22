import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableComponent } from './resizable.component';
import { ResizableDirective } from './resizable.directive';



@NgModule({
  declarations: [ResizableComponent, ResizableDirective],
  exports: [
    ResizableComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ResizableModule { }
