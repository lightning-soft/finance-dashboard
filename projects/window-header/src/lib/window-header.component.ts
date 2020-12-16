import { Component, Input } from '@angular/core';
import { ILayoutNode } from 'layout';

@Component({
  selector: 'window-header',
  templateUrl: './window-header.component.html',
  styleUrls: ['./window-header.component.scss'],
})
export class WindowHeaderComponent {
  @Input() window: ILayoutNode;
  @Input() className: string;
}
