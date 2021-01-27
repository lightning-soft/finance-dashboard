import { Component, HostListener, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { KeyBinding, SettingsKeyboardListener } from 'keyboard';

@Component({
  selector: 'hotkey',
  templateUrl: './hotkey.component.html',
  styleUrls: ['./hotkey.component.scss']
})
export class HotkeyComponent extends FieldType {
  keyboardListener = new SettingsKeyboardListener();
  isKeyboardRecording = false;

  get binding() {
    const value = this.formControl.value;
    if (value)
      return KeyBinding.fromDTO(value);
  }

  @HostListener('window:keyup', ['$event'])
  @HostListener('window:keydown', ['$event'])
  onKeyEvent($event) {
    if (this.isKeyboardRecording && $event instanceof KeyboardEvent) {
      $event.preventDefault();
      this.keyboardListener.handle($event);
      return true;
    }
    return false;
  }

  changeHotkey($event: MouseEvent) {
    $event.preventDefault();
    this.isKeyboardRecording = true;
    const prevBinding = this.binding;
    this.keyboardListener.onFinised(() => {
      this.updateHotkey(this.keyboardListener.snapshot());
      this.keyboardListener.clear();
      this.isKeyboardRecording = false;
    });

    this.keyboardListener.onCanceled(() => {
      this.updateHotkey(prevBinding);
      this.keyboardListener.clear();
      this.isKeyboardRecording = false;
    });

    this.keyboardListener.onCleared(() => {
       this.updateHotkey(this.keyboardListener.snapshot());
    });

    this.keyboardListener.onChanged(() => this.updateHotkey(this.keyboardListener.snapshot()));
  }

  updateHotkey(value) {
    this.formControl.patchValue(value?.toDTO());
  }

  getKeyStringTitle() {
    if (this.binding)
      return this.binding.toUIString();
    return '';
  }
}
