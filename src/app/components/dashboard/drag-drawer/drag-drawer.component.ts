import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChildren } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LayoutComponent } from 'layout';

@UntilDestroy()
@Component({
  selector: 'app-drag-drawer',
  templateUrl: './drag-drawer.component.html',
  styleUrls: ['./drag-drawer.component.scss']
})
export class DragDrawerComponent implements AfterViewInit {
  @Input() layout: LayoutComponent;
  @Input() isOpen = false;
  @Output() hide = new EventEmitter();

  @ViewChildren('add') viewItems;

  items = [
    {
      icon: 'icon-logo',
      text: 'Trading \n' +
        '    Chart',
      component: 'chart'
    },
    {
      text: 'Market \n' +
        'Watch',
      icon: 'icon-watch',
      component: 'watchlist'

    },
    /* {
       text: ' Orders\n' +
         'Book',
       icon: 'icon-orders'
     },
     {
       text: 'Positions',
       icon: 'icon-positions'
     }*/
  ];

  ngAfterViewInit() {
    const layout = this.layout;
    layout.on('init', () => {
      layout.on('componentCreated', () => this.hide.emit());
      if (layout.canDragAndDrop) {
        this.viewItems._results.forEach((item, index) => {
          layout.createDragSource(item.nativeElement, this.items[index].component);
        });
      }
    });
  }
}
