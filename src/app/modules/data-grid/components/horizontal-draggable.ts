import {Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';

export interface HorizontalDraggableDimensions {
  left: number;
  minLeft: number;
  maxLeft: number;
}

@Directive({
  selector: '[horizontalDraggable]',
})
export class HorizontalDraggable implements OnInit, OnDestroy {
  private _dimensions: HorizontalDraggableDimensions;

  @Output()
  private drag = new EventEmitter();

  get nativeElement() {
    return this._elementRef && this._elementRef.nativeElement;
  }

  @Input()
  set dimensions(value: HorizontalDraggableDimensions) {
    if (!value)
      return;

    this._dimensions = value;
  }

  constructor(private _elementRef: ElementRef) {

  }

  ngOnInit(): void {
    // $(this.nativeElement).draggable({
    //   axis: 'x',
    //   classes: {
    //     'ui-draggable-dragging': 'active',
    //   },
    //   drag: (dragEvent: Event, obj) => {
    //     obj.position.left = this._getLeftPosition(obj.position.left);
    //     this.drag.next(obj.position.left);
    //   },
    // });
  }

  private _getLeftPosition(left): number {
    let {_dimensions} = this;

    if (left < _dimensions.minLeft)
      left = _dimensions.minLeft;
    else if (_dimensions.maxLeft != null && left > _dimensions.maxLeft)
      left = _dimensions.maxLeft;

    return left;
  }

  ngOnDestroy(): void {
    // $(this.nativeElement).draggable('destroy');
  }
}
