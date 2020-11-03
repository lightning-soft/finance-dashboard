import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {

  notifications = [];
  visible = false;

  constructor() { }

  ngOnInit(): void {
  }

  closeList(): void {
    this.visible = false;
  }
}
