import { Cell, ICellConfig } from './cell';

export enum Icon {
  Close = 'close',
  MoveDown = 'moveDown',
  MoveUp = 'moveUp',
  Stop = 'stop',
  Play = 'play',
}

interface IIconCellConfig extends ICellConfig {
  icon?: Icon;
  size?: number;
}

export class IconCell extends Cell {
  private _icon: Icon;
  private _size: number;

  constructor(config?: IIconCellConfig) {
    super(config);
    this._icon = config?.icon ?? Icon.Close;
    this._size = config?.size;
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
        drawClose(context, this._size);
        break;
      case Icon.MoveDown:
        drawMoveDown(context);
        break;
      case Icon.MoveUp:
        drawMoveUp(context);
        break;
      case Icon.Stop:
        drawStop(context);
        break;

      case Icon.Play:
        drawPlay(context);
        break;
    }

    return true;
  }
}

function drawClose(context, size?: number) {
  const ctx = context.ctx;
  const x = context.x + context.width / 2;
  const y = context.y + context.height / 2;
  const offset = (size ?? context.height * 0.6) / 2;

  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.beginPath();

  ctx.moveTo(x - offset, y - offset);
  ctx.lineTo(x + offset, y + offset);

  ctx.moveTo(x + offset, y - offset);
  ctx.lineTo(x - offset, y + offset);
  ctx.stroke();
  ctx.restore();
}

function drawMoveDown(context) {
  const ctx = context.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(36,38,44,1)';
  const buttonSize = 20;
  ctx.fillRect(context.x, context.y, buttonSize, buttonSize);
  ctx.restore();
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(201,59,59,1)';
  const startX = context.x + 3;
  const startY = context.y + 5;
  ctx.moveTo(startX, startY);
  ctx.lineTo(context.x + buttonSize / 2, context.y + 3 + buttonSize / 2);
  ctx.stroke();
  ctx.lineTo(context.x + buttonSize - 3, startY);
  ctx.stroke();
}

function drawStop(context) {
  const ctx = context.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(36,38,44,1)';
  const size = 16;
  const innerSize = 6;
  ctx.fillRect(context.x, context.y, size, size);
  ctx.fillStyle = 'rgba(208,208,210,1)';
  ctx.fillRect(context.x + 5, context.y + 5, innerSize, innerSize);
}

function drawMoveUp(context) {
  const ctx = context.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(36,38,44,1)';
  const buttonSize = 20;
  ctx.fillRect(context.x, context.y, buttonSize, buttonSize);
  ctx.restore();
  ctx.beginPath();
  ctx.strokeStyle = '#0C62F7';
  const startX = context.x + 3;
  const startY = context.y + buttonSize - 5;
  ctx.moveTo(startX, startY);
  ctx.lineTo(context.x + buttonSize / 2, context.y - 2 + buttonSize / 2);
  ctx.stroke();
  ctx.lineTo(context.x + buttonSize - 3, startY);
  ctx.stroke();
}

function drawPlay(context) {
  const ctx = context.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(36,38,44,1)';
  const size = 16;

  ctx.fillRect(context.x, context.y, size, size);
  const padding = 6;
  const top = context.y + padding;
  const right = context.x + 6 + padding;
  const bottom = top + 6;
  ctx.beginPath();
  ctx.fillStyle = 'rgba(208,208,210,1)';
  ctx.moveTo(context.x + 6, top);
  ctx.lineTo(right, (top + bottom) / 2);
  ctx.lineTo(context.x + 6, bottom);
  ctx.lineTo(context.x + 6, top);
  ctx.fill();
}
