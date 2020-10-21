import {Cell} from './cell';

export class EmptyCell extends Cell {
  constructor() {
    super();
    this.value = '';
  }

  updateValue(...args: any[]) {
  }

}
