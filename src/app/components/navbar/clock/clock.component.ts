import { Component, OnInit } from '@angular/core';
import {NzModalService} from "ng-zorro-antd";
import {AddTimezoneModalComponent} from "../add-timezone-modal/add-timezone-modal.component";

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit {
  time: number;

  constructor(private modalService: NzModalService) {
    setInterval(() => {
      this.time = Date.now();
    }, 1000);
  }

  ngOnInit(): void {
  }

  addTimezone(): void {
    this.modalService.create({
      nzContent: AddTimezoneModalComponent,
      nzWrapClassName: 'timezones-modal vertical-center-modal',
      nzFooter: null
    });
  }
}
