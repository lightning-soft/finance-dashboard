import {Cell} from './cell';

export class TimeCell extends Cell {
  value: string;

  updateValue(value) {
    this.value = moment(value).formatToAppDateTime();
  }
}
