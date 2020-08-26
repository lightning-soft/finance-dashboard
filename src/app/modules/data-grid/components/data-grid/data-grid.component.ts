import {
  AfterViewInit,
  Component, ElementRef,
  Input, OnDestroy, ViewChild
} from '@angular/core';
import { ICell } from '../../models';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { IViewBuilderStore, ViewBuilderStore } from '../view-builder-store';
import { IconComponent, iconComponentSelector } from '../../models/cells/components/icon-conponent';
import { DataGridHandler, Events, IHandler } from './data-grid.handler';
import { Subject} from 'rxjs';

export interface DataGridItem {
  [key: string]: ICell;
}

@Component({
  selector: 'data-grid',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.scss'],
  providers: [{
    provide: IViewBuilderStore,
    useValue: new ViewBuilderStore({
      [iconComponentSelector]: IconComponent
    })
  }]
})
export class DataGrid<T extends DataGridItem = any> implements AfterViewInit, OnDestroy{
  rowHeight = 35;

  onDestroy$ = new Subject();

  @ViewChild('tableContainer') tableContainer: ElementRef;

  @Input()
  handlers: DataGridHandler[] = [];

  @ViewChild(CdkVirtualScrollViewport)
  public viewPort: CdkVirtualScrollViewport;

  @Input()
  columns = [];

  @Input()
  items: T[];

  private _handlers = [];

  private _subscribedEvents = [];

  ngAfterViewInit(): void {
    this._handlers = this.initHandlers() || [];
    for (let handler of this._handlers) {
      handler.events.forEach(e => this._subscribeOnEvents(e));
    }
  }

  initHandlers(): IHandler[] {
    const handlers = [];


    if (!Array.isArray(this.handlers))
      this.handlers = [];

    this.handlers.forEach(h => h.dataGrid = this);

    return [
      ...this.handlers.map(h => h.tableHandler),
      ...handlers
    ];
  }

  trackByFn(index) {
    return index;
  }

  public get inverseTranslation(): string {
    if (!this.viewPort || !this.viewPort['_renderedContentOffset']) {
      return '-0px';
    }

    const offset = this.viewPort['_renderedContentOffset'] + 1;
    return `-${offset}px`;
  }

  private _handleEvent(event) {
    if (!this._handlers)
      return;
    for (let handler of this._handlers) {
      if (handler.events.some(e => e === event.type) && handler.handleEvent(event))
        return null;
    }
  }

  private _subscribeOnEvents(event: Events) {
    let element = this.tableContainer && this.tableContainer.nativeElement;
    if (!element)
      return;

    if (this._subscribedEvents.every(e => e !== event)) {
      this._subscribedEvents.push(event);
      let fn = (evt: Event) => this._handleEvent(evt);

      element.addEventListener(event, fn);
      this.onDestroy$.subscribe(() => element && element.removeEventListener(event, fn));
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
