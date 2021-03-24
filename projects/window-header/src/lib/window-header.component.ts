import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ILayoutNode } from 'layout';
import { WindowPopupManager } from '../../../layout/src/services/window-popup-manager';

@Component({
  selector: 'window-header',
  templateUrl: './window-header.component.html',
  styleUrls: ['./window-header.component.scss'],
})
export class WindowHeaderComponent {
  @Input() window: ILayoutNode;
  @Input() className: string;
  @Input() marginClass = 'mx-3';
  @Output() close = new EventEmitter<boolean>();

  constructor(private windowPopupManager: WindowPopupManager) {
  }

  onClose() {
    this.close.emit(true);
    this.window.close();
  }

  popup() {
    this.windowPopupManager.openPopup(this.window);
  }

  hideInstruments() {
   return  this.windowPopupManager.hideWindowHeaderInstruments;
  }
}
