import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'time-select',
  templateUrl: './time-select.component.html',
  styleUrls: ['./time-select.component.scss'],
})
export class TimeSelectComponent implements OnInit, OnChanges {

  @Input() value: number;
  @Input() step = 15;

  @Output() valueChange = new EventEmitter<number>();

  inited = false;
  hours: number;
  minutes: number;
  partOfDay: string;
  partsOfDay = ['AM', 'PM'];

  constructor() { }

  ngOnInit() {
    this.inited = true;

    this._handleValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value) {
      this._handleValue();
    }
  }

  formatter(value: number): string {
    return (value || 0).toString().padStart(2, '0');
  }

  parser(value: string): number {
    const val = +value;

    return !isNaN(val) ? val : 0;
  }

  handleHoursChange(hours: number) {
    if (hours < this.hours && hours === 11 || hours > this.hours && hours === 12) {
      this.partOfDay = this.partOfDay === 'AM' ? 'PM' : 'AM';
    }

    if (hours < 1) {
      hours = 12;
    }

    if (hours > 12) {
      hours = 1;
    }

    this.hours = hours;

    this.handleValueChange();
  }

  handleMinutesChange(minutes: number) {
    if (minutes >= 0 && minutes < 60) {
      this.minutes = minutes;

      this.handleValueChange();
    } else {
      if (minutes < 0) {
        this.minutes = 60 - this.step;

        this.handleHoursChange(this.hours - 1);
      } else {
        this.minutes = 0;

        this.handleHoursChange(this.hours + 1);
      }
    }
  }

  handleValueChange() {
    const amTime = this.partOfDay === 'PM' ? 12 * 3600 : 0;
    const hours = this.hours === 12 ? 0 : this.hours;

    this.value = (amTime + hours * 3600 + this.minutes * 60) * 1000;

    this.valueChange.emit(this.value);
  }

  private _handleValue() {
    const seconds = this.value / 1000;

    const hours = Math.floor(seconds / 3600);
    const minutes = seconds % 3600 / 60;

    this.minutes = minutes;

    if (hours < 12) {
      this.hours = hours === 0 ? 12 : hours;
      this.partOfDay = 'AM';
    } else {
      const _hours = hours - 12;

      this.hours = _hours === 0 ? 12 : _hours;
      this.partOfDay = 'PM';
    }
  }

}
