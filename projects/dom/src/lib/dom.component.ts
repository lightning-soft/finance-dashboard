import { Component, OnInit } from '@angular/core';
import { LayoutNode, ILayoutNode } from 'layout';
import { Column } from 'data-grid';

export interface DomComponent extends ILayoutNode { }

@Component({
  selector: 'lib-dom',
  templateUrl: './dom.component.html',
})
@LayoutNode()
export class DomComponent implements OnInit {
  columns: Column[] = [
    'orders',
    'contracts',
    'price',
    'changing',
    'bid',
    'last',
    'current',
    'ask',
    'total',
  ].map(name => ({ name, visible: true }));

  items = [];

  constructor() {
    this.setTabIcon('icon-widget-positions');
    this.setTabTitle('Dom');
  }

  ngOnInit(): void {
  }
}
