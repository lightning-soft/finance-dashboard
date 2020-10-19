import {Component, Input} from '@angular/core';
import {Cell} from '../cell';

export const iconComponentSelector = 'icon-component';

@Component({
  selector: iconComponentSelector,
  templateUrl: './icon-component.html'
})
export class IconComponent {
  @Input() cell: Cell;
}
