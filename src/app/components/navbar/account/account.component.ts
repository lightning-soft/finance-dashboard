import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  
  visible = false;

  constructor() { }

  ngOnInit(): void {
  }

  logout(): void {
    console.log('Todo -> logout logic');
    this.visible = false;
  }

  changeName(): void {
    console.log('Todo -> change name logic');
    this.visible = false;
  }

}
