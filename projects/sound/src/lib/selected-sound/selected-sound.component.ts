import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-selected-sound',
  templateUrl: './selected-sound.component.html',
  styleUrls: ['./selected-sound.component.css']
})
export class SelectedSoundComponent implements OnInit {
  @Input() selectedSound: string;
  @Output() nativeSelect:  EventEmitter<string> = new EventEmitter<string>();

  readonly soundList: any[] = [
    'Ahooga',
    'Alarm',
    'Apert',
    'Apert2',
    'Arrowhit',
    'Beam1',
    'Beep',
    'Beep2',
    'Beep3',
    'BeepHigh',
    'BeepHigh2',
    'BeepHigh3',
    'BeepMiddle',
    'Bell',
    'Binds',
    'Blip',
    'Blip2',
    'Bullet',
    'Busy',
    'Buzz',
    'Buzzer',
    'Camera',
    'Carbrake',
    'Cashreg',
    'CensoredBeep',
    'Chime',
    'Chord',
    'Close',
    'Connected',
    'Ding',
    'Ding2',
    'Ding3',
    'Ding4',
    'Disconnect',
    'Drip',
    'Drumrol',
    'Explode',
    'Gong',
    'Hammer',
    'MarketBell',
    'Notification',
    'Nudge',
    'Pairing',
    'Rings',
    'SirenBritish',
    'SonarPing',
    'SpaceAlarm',
    'SpaceAlert',
    'Tada',
    'Train',
    'Uhoh',
    'Whip'
  ];

  constructor() { }

  ngOnInit(): void {
    console.log("Selected sound");
  }

  selecte(sound: string): void {
    this.selectedSound = sound;
  }

}
