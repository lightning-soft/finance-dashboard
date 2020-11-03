import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trade-lock',
  templateUrl: './trade-lock.component.html',
  styleUrls: ['./trade-lock.component.scss']
})
export class TradeLockComponent implements OnInit {

  lockIcons: [string, string] = ['lock', 'unlock'];
  unlocked = false;

  showAlert = false;

  constructor() { }

  ngOnInit(): void {
  }

  handleLock(): void {
    console.log(`Todo -> set trading state to ${!this.unlocked}`)
    this.unlocked = !this.unlocked;

    if (!this.unlocked) {
      this.showAlert = true;

      setTimeout(() => {
        this.showAlert = false;
      }, 3000);
    }
  }

}
