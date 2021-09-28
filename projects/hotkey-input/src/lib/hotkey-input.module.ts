import { NgModule } from '@angular/core';
import { HotkeyInputComponent } from './hotkey-input.component';
import { CommonModule } from '@angular/common';
import { KeyBindingPipe } from './key-binding.pipe';


@NgModule({
  declarations: [HotkeyInputComponent, KeyBindingPipe],
  imports: [
    CommonModule
  ],
  exports: [HotkeyInputComponent, KeyBindingPipe]
})
export class HotkeyInputModule { }
