import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {

  notifications = [{id: 1, text: 'fasdf'}];
  visible = false;

  constructor() { }

  ngOnInit(): void {
  }

  closeList(): void {
    this.visible = false;
  }
}
