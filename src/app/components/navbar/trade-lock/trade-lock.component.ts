import { Component, OnInit } from '@angular/core';
import { TimeoutError } from 'rxjs';

type Alert = {
  visible: boolean,
  text: string,
  type: string
};

const lock = {
  visible: true,
  text: 'Trading is locked',
  type: 'lock',
};

const unlock = {
  visible: true,
  text: 'Trading is unlocked',
  type: 'unlock',
};

@Component({
  selector: 'app-trade-lock',
  templateUrl: './trade-lock.component.html',
  styleUrls: ['./trade-lock.component.scss']
})
export class TradeLockComponent implements OnInit {

  lockIcons: [string, string] = ['lock', 'unlock'];
  unlocked = false;

  private timerId;

  alert: Alert;

  constructor() { }

  ngOnInit(): void {
  }

  handleLock(): void {
    console.log(`Todo -> set trading state to ${!this.unlocked}`);

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    this.unlocked = !this.unlocked;

    this.alert = this.unlocked ? Object.assign({}, unlock) : Object.assign({}, lock);

    this.timerId = setTimeout(() => {
      this.alert.visible = false;
    }, 1500);
  }

}
