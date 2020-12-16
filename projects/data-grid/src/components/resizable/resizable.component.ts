import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'th[resizable]',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.scss']
})
export class ResizableComponent {
  @HostBinding('style.width.px')
  width: number | null = null;

  onResize(width: number) {
    this.width = width;
  }

}
