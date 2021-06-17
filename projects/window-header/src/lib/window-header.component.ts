import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ILayoutNode, WindowPopupManager } from 'layout';

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

  onClose(): void {
    this.close.emit(true);
    this.window.close();
  }

  popup(): void {
    this.windowPopupManager.openWidget(this.window);
  }

  hideInstruments(): boolean {
    return this.windowPopupManager.hideWindowHeaderInstruments;
  }
}
