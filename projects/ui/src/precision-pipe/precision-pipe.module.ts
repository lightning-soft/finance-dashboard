import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { PrecisionPipe } from "./precision.pipe";

@NgModule({
  imports: [CommonModule],
  declarations: [PrecisionPipe],
  exports: [PrecisionPipe]
})
export class PrecisionPipeModule {
}
