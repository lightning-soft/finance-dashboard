import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FixedNumberPipe } from "./fixed-number.pipe";

@NgModule({
  imports: [CommonModule],
  declarations: [FixedNumberPipe],
  exports: [FixedNumberPipe]
})
export class FixedNumberModule {
}
