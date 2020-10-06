import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appResizeble]'
})
export class ResizebleDirective implements OnInit{


  @Input() resizableGrabWidth = 1;
  @Input() resizableMinWidth = 100;

  dragging = false;

  constructor(private el: ElementRef) {

    const self = this;

    const EventListenerMode = { capture: true };

    function preventGlobalMouseEvents() {
      document.body.style['pointer-events'] = 'none';
    }

    function restoreGlobalMouseEvents() {
      document.body.style['pointer-events'] = 'auto';
    }


    const newWidth = (wid) => {
      const newWidth = Math.max(this.resizableMinWidth, wid);
      el.nativeElement.style.width = (newWidth) + 'px';
    };


    const mouseMoveG = (evt) => {
      if (!this.dragging) {
        return;
      }
      newWidth(evt.clientX - el.nativeElement.offsetLeft);
      evt.stopPropagation();
    };

    const dragMoveG = (evt) => {
      if (!this.dragging) {
        return;
      }
      const newWidth = Math.max(this.resizableMinWidth, (evt.clientX - el.nativeElement.offsetLeft)) + 'px';
      el.nativeElement.style.width = (evt.clientX - el.nativeElement.offsetLeft) + 'px';
      evt.stopPropagation();
    };

    const mouseUpG = (evt) => {
      if (!this.dragging) {
        return;
      }
      restoreGlobalMouseEvents();
      this.dragging = false;
      evt.stopPropagation();
    };

    const mouseDown = (evt) => {
      if (this.inDragRegion(evt)) {
        this.dragging = true;
        preventGlobalMouseEvents();
        evt.stopPropagation();
      }
    };


    const mouseMove = (evt) => {
      if (this.inDragRegion(evt) || this.dragging) {
        el.nativeElement.style.cursor = 'col-resize';
      } else {
        el.nativeElement.style.cursor = 'default';
      }
    };


    document.addEventListener('mousemove', mouseMoveG, true);
    document.addEventListener('mouseup', mouseUpG, true);
    el.nativeElement.addEventListener('mousedown', mouseDown, true);
    el.nativeElement.addEventListener('mousemove', mouseMove, true);
  }

  ngOnInit(): void {
    this.el.nativeElement.style['border-left'] = this.resizableGrabWidth + 'px solid lightslategray';
    this.el.nativeElement.style['border-right'] = this.resizableGrabWidth + 'px solid lightslategray';
  }

  inDragRegion(evt) {
    return this.el.nativeElement.clientWidth - evt.clientX + this.el.nativeElement.offsetLeft < this.resizableGrabWidth;
  }
}
