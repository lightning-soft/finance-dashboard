import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NullCoalescingPipe } from './null-coalescing.pipe';

@NgModule({
  declarations: [
    NullCoalescingPipe
  ],
  exports: [
    NullCoalescingPipe
  ],
  imports: [
    CommonModule
  ],
  entryComponents: [
  ]
})
export class NullCalescingModule {

}
