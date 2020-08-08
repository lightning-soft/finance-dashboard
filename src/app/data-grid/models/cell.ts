export interface ICell {
  component?: string;
  value: string;
  class?: string;

  updateValue(...args: any[]);

  clear();
}

export abstract class Cell implements ICell {
  value = '';

  abstract updateValue(...args: any[]);

  clear() {
    this.value = '';
  }
}

export class ReadonlyCell implements ICell {
  value = '';

  constructor(value?: string) {
    this.value = value || '';
  }

  updateValue(...args: any[]) {

  }

  clear() {
  }
}


