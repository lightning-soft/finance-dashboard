import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {Components} from 'lazy-modules';
import {UntilDestroy} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-drag-drawer',
  templateUrl: './drag-drawer.component.html',
  styleUrls: ['./drag-drawer.component.scss']
})
export class DragDrawerComponent implements OnInit {

  @Input() isOpen = false;

  @ViewChildren('add') viewItems;

  items = [
    {
      icon: 'icon-logo',
      text: 'Trading \n' +
        '    Chart',
      component: Components.Chart
    },
    {
      text: 'Market \n' +
        'Watch',
      icon: 'icon-watch',
      component: Components.Watchlist

    },
    /* {
       text: ' Orders\n' +
         'Book',
       icon: 'icon-orders'
     },*/
     {
       text: 'Positions',
       icon: 'icon-position',
       component:  Components.Positions
     }
  ];


  ngOnInit(): void {
  }

  initLayoutDragAndDrop(layout) {

    this.viewItems._results.forEach((item, index) => {
      layout.createDragSource(item.nativeElement,
        {
          title: this.items[index].component,
          type: 'component',
          componentName: this.items[index].component,
        });
    });
  }

}
