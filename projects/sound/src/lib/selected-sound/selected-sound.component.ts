import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SoundService } from '../sound.service';

@Component({
  selector: 'lib-selected-sound',
  templateUrl: './selected-sound.component.html',
  styleUrls: ['./selected-sound.component.scss']
})
export class SelectedSoundComponent {
  @Input() selectedSound: string;
  @Input() volume: number;
  @Output() nativeSelect: EventEmitter<string> = new EventEmitter<string>();
  isVisible = false;

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

  constructor(
    public readonly soundService: SoundService,
  ) { }

  select(sound: string): void {
    this.selectedSound = sound;
    this.nativeSelect.emit(sound);
  }

  play(sound: string): void {
    const procent = 100;
    this.soundService.playByName(sound, this.volume / procent);
  }
}
