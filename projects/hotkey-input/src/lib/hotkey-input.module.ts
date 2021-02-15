import { NgModule } from '@angular/core';
import { HotkeyInputComponent } from './hotkey-input.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [HotkeyInputComponent],
    imports: [
        CommonModule
    ],
  exports: [HotkeyInputComponent]
})
export class HotkeyInputModule { }
