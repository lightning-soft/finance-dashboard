import { Component, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KeyBinding, SettingsKeyboardListener } from 'keyboard';

@Component({
  selector: 'hotkey-input',
  templateUrl: './hotkey-input.component.html',
  styleUrls: [
    './hotkey-input.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HotkeyInputComponent),
      multi: true
    }
  ],
})
export class HotkeyInputComponent implements ControlValueAccessor {
  keyboardListener = new SettingsKeyboardListener();
  isKeyboardRecording = false;
  @Input() value: KeyBinding;
  @Output() valueChange = new EventEmitter<KeyBinding>();
  onChange;
  prevBinding;

  get keyboardListenerBinding() {
    return this.keyboardListener.snapshot().toDTO();
  }

  @HostListener('window:keyup', ['$event'])
  @HostListener('window:keydown', ['$event'])
  onKeyEvent($event) {
    if (this.isKeyboardRecording && $event instanceof KeyboardEvent) {
      $event.preventDefault();
      this.keyboardListener.handle($event);
      return false;
    }
  }

  changeHotkey($event: MouseEvent) {
    $event.preventDefault();
    this.isKeyboardRecording = true;
    this.prevBinding = this.value;
    this.keyboardListener.onFinised(() => {
      this.finish();
    });

    this.keyboardListener.onCanceled(() => {
      this.cancel();
    });

    this.keyboardListener.onCleared(() => {
      this.updateHotkey(this.keyboardListener.snapshot());
    });

    this.keyboardListener.onChanged(() => this.updateHotkey(this.keyboardListener.snapshot(), false));
  }

  finish() {
    this.updateHotkey(this.value);
    this.keyboardListener.clear();
    this.isKeyboardRecording = false;
  }

  cancel() {
    this.updateHotkey(this.prevBinding, false);
    this.keyboardListener.clear();
    this.isKeyboardRecording = false;
  }

  updateHotkey(value, emit = true) {
    this.value = value;
    if (emit) {
      this.valueChange.emit(value);
      if (this.onChange)
        this.onChange(value?.toDTO());
    }
  }


  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    if (obj)
      this.value = KeyBinding.fromDTO(obj);
    else
      this.value = null;
  }

  saveHotkey() {
    if (!this.isKeyboardRecording) {
      return;
    }
    this.finish();
  }
}
