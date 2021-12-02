import { Pipe, PipeTransform } from '@angular/core';
import { IKeyBindingDTO, KeyBinding } from "keyboard";

@Pipe({
  name: 'keyBinding',
})
export class KeyBindingPipe implements PipeTransform {
  transform(value: any): any {
    if (!value)
      return '';

    if (value && value.toUIString)
      return value.toUIString();
    else
      return KeyBinding.fromDTO(value as IKeyBindingDTO).toUIString();
  }
}
