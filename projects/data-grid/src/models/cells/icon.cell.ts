import {Cell} from './cell';
import { iconComponentSelector } from './components/icon-conponent';
export class IconCell extends Cell{
  component = iconComponentSelector;

  constructor(public iconClass) {
    super();
    this.class = iconClass;
  }

  updateValue(...args: any[]) {
  }

}
