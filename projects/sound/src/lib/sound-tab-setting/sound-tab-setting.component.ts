import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-sound-tab-setting',
  templateUrl: './sound-tab-setting.component.html',
  styleUrls: ['./sound-tab-setting.component.css']
})
export class SoundTabSettingComponent implements OnInit {
  readonly settingName: { name: string; selectedSound: string; volume: number; }[] = [
    {
      name: "Connected",
      selectedSound: "Apert",
      volume: 80
    },
    {
      name: "Connection Lost",
      selectedSound: "Beam1",
      volume: 80
    },
    {
      name: "Order Filled",
      selectedSound: "Ding",
      volume: 100
    },
    {
      name: "Order Cancelled",
      selectedSound: "Beep",
      volume: 100
    },
    {
      name: "Order Replaced",
      selectedSound: "Close",
      volume: 100
    },
    {
      name: "Order Pending",
      selectedSound: "Blip2",
      volume: 100
    },
    {
      name: "Order Rejected",
      selectedSound: "Bullet",
      volume: 100
    },
    {
      name: "Target Filled",
      selectedSound: "Cashreg",
      volume: 80
    },
    {
      name: "Stop Filled",
      selectedSound: "Buzz",
      volume: 100
    },
    {
      name: "Alert",
      selectedSound: "Arrowhit",
      volume: 100
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
