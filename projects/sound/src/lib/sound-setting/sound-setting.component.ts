import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-sound-setting',
  templateUrl: './sound-setting.component.html',
  styleUrls: ['./sound-setting.component.css']
})
export class SoundSettingComponent implements OnInit {
  @Input() name: string;
  @Input() selectedSound: string = 'Hangzhou';
  @Input() volume: number = 30;

  readonly soundList: string[] = [
    'Hangzhou', 'Ningbo', 'Wenzhou'
  ]

  constructor() { }

  ngOnInit(): void {
  }

  formatter(value: number): string {
    return `${value}%`;
  }

}
