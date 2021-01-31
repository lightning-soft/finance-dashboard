import { Cell } from './cell';

export enum Icon {
  Close = 'close',
}

export class IconCell extends Cell {

  constructor(private _icon: Icon = Icon.Close) {
    super();
  }

  updateValue(...args: any[]) {
  }

  updateClass(iconClass: string) {
    this.class = iconClass;
  }

  draw(context) {
    const ctx = context?.ctx;
    if (!ctx)
      return;

    switch (this._icon) {
      case Icon.Close:
        const x = context.x + context.width / 2;
        const y = context.y + context.height / 2;
        const offset = (context.height * 0.6) / 2;

        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.beginPath();

        ctx.moveTo(x - offset, y - offset);
        ctx.lineTo(x + offset, y + offset);

        ctx.moveTo(x + offset, y - offset);
        ctx.lineTo(x - offset, y + offset);
        ctx.stroke();
        ctx.restore();
        break;
    }

    return true;
  }
}
