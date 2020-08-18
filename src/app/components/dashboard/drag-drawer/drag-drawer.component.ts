import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {NavigationDrawerService} from '../navigation-drawer.service';

@Component({
  selector: 'app-drag-drawer',
  templateUrl: './drag-drawer.component.html',
  styleUrls: ['./drag-drawer.component.scss']
})
export class DragDrawerComponent implements OnInit, OnDestroy {

  isOpen$ = this.navigationDrawerService.isOpen$
    .pipe();
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

  constructor(private navigationDrawerService: NavigationDrawerService,
              private changeDetectorRef: ChangeDetectorRef) {
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

  closeDrawer() {
    this.navigationDrawerService.close();
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
  }
}
