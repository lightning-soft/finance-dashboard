import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ILayoutNode } from 'layout';

@Component({
  selector: 'window-header',
  templateUrl: './window-header.component.html',
  styleUrls: ['./window-header.component.scss'],
})
export class WindowHeaderComponent {
  @Input() window: ILayoutNode;
  @Input() className: string;
  @Output() close = new EventEmitter<boolean>();

  onClose() {
    this.close.emit(true);
    this.window.close();
  }
}
