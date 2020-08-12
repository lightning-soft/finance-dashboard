import {Component, OnInit, ViewChild} from '@angular/core';
import {NavigationDrawerService} from '../navigation-drawer.service';

@Component({
  selector: 'app-drag-drawer',
  templateUrl: './drag-drawer.component.html',
  styleUrls: ['./drag-drawer.component.scss']
})
export class DragDrawerComponent implements OnInit {

  isOpen$ = this.navigationDrawerService.isOpen$;

  @ViewChild('addChart') addChart;
  @ViewChild('addWatch') addWatch;

  constructor(private navigationDrawerService: NavigationDrawerService) { }

  ngOnInit(): void {
  }

  initLayoutDragAndDrop(layout) {
    layout.createDragSource(this.addChart.nativeElement,
      {
        title: 'chart',
        type: 'component',
        componentName: 'chart',
      });

    layout.createDragSource(this.addWatch.nativeElement,
      {
        title: 'watchlist',
        type: 'component',
        componentName: 'watchlist',
      });
  }

}
