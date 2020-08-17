import {Component, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {NavigationDrawerService} from '../navigation-drawer.service';
import {Components} from 'lazy-modules';

@Component({
  selector: 'app-drag-drawer',
  templateUrl: './drag-drawer.component.html',
  styleUrls: ['./drag-drawer.component.scss']
})
export class DragDrawerComponent implements OnInit {

  isOpen$ = this.navigationDrawerService.isOpen$;
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

  constructor(private navigationDrawerService: NavigationDrawerService) {
  }

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
