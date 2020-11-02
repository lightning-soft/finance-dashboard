import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit {

  time: number;

  constructor() { 
    setInterval(() => {
      this.time = Date.now();
    }, 1000)
  }

  ngOnInit(): void {
  }

  openModal(): void {
    console.log('Todo -> open modal');
  }
}
