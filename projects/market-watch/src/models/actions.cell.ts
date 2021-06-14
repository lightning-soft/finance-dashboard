import { Cell } from 'data-grid';

const size = 7;
const buttonSize = 14;
const paddingLeft = 6;
const paddingTop = 5;
const buttonMargin = 4;

export const disabledStyles = {
  backgroundColor: 'rgba(27,29,34,0.3)',
  drawingColor: 'rgba(208,208,210,0.3)',
};
export const enabledStyles = {
  backgroundColor: '#1B1D22',
  drawingColor: '#D0D0D2',
};

export enum PerformedAction {
  Close,
  Stop,
  Play,
  None
}

function checkAction(event: MouseEvent, x, y) {
  return event.offsetX >= x && event.offsetX <= x + buttonSize
    && event.offsetY >= y && y <= y + buttonSize;
}

export interface ActionCellState {
  play: boolean;
  stop: boolean;
  close: boolean;
}

export class ActionsCell extends Cell {
  x: number;
  y: number;

  private _state: ActionCellState = {
    play: true,
    stop: true,
    close: true,
  };

  setState(state: ActionCellState) {
    this._state = state;
    this.drawed = false;
  }

  constructor() {
    super();
    this.drawed = false;
  }

  checkAction(event: MouseEvent): PerformedAction {
    if (this._state.close && checkAction(event, this.x, this.y))
      return PerformedAction.Close;

    if (this._state.stop && checkAction(event, this.x + buttonSize + buttonMargin, this.y))
      return PerformedAction.Stop;

    if (this._state.play && checkAction(event, (buttonSize + buttonMargin) * 2, this.y))
      return PerformedAction.Play;

    return PerformedAction.None;
  }

  updateValue() {

  }

  draw(context) {
    const ctx: CanvasRenderingContext2D = context?.ctx;

    if (!ctx)
      return;

    this.x = context.x + paddingLeft;
    this.y = context.y + paddingTop;
    drawCloseIcon({
      x: this.x,
      y: this.y,
      height: context.height,
      ctx,
      styles: this._state.close ? enabledStyles : disabledStyles
    });

    drawStopButton({
      x: this.x + buttonSize + buttonMargin,
      y: this.y,
      height: context.height,
      ctx,
      styles: this._state.stop ? enabledStyles : disabledStyles
    });
    drawPlayButton({
      x: this.x + (buttonSize + buttonMargin) * 2,
      y: this.y,
      height: context.height,
      ctx,
      styles: this._state.play ? enabledStyles : disabledStyles
    });


    return true;
  }
}

function drawStopButton({ x, y, height, ctx, styles }) {
  ctx.save();
  ctx.fillStyle = styles.backgroundColor;

  ctx.fillRect(x, y, buttonSize, buttonSize);
  const centerX = x + (buttonSize / 2);
  const centerY = y + (buttonSize / 2);
  const stopButtonSize = 5;
  ctx.fillStyle = styles.drawingColor;
  ctx.fillRect(centerX - (stopButtonSize / 2), centerY - (stopButtonSize / 2), stopButtonSize, stopButtonSize);
  ctx.restore();
}

function drawPlayButton({ x, y, height, ctx, styles }) {
  ctx.save();
  ctx.fillStyle = styles.backgroundColor;

  ctx.fillRect(x, y, buttonSize, buttonSize);
  const centerX = x + (buttonSize / 2);
  const centerY = y + (buttonSize / 2);
  const triangleOffset = 3;

  ctx.moveTo(centerX - triangleOffset, centerY - triangleOffset);
  ctx.lineTo(centerX + triangleOffset, centerY);
  ctx.lineTo(centerX - triangleOffset, centerY + triangleOffset);
  ctx.lineTo(centerX - triangleOffset, centerY - triangleOffset);
  ctx.fillStyle = styles.drawingColor;
  ctx.fill();
  ctx.restore();
}

function drawCloseIcon({ x, y, height, ctx, styles }) {

  const offset = (size ?? height * 0.4) / 2;

  ctx.save();
  ctx.fillStyle = styles.backgroundColor;

  ctx.fillRect(x, y, buttonSize, buttonSize);

  ctx.beginPath();
  const centerX = x + (buttonSize / 2);
  const centerY = y + (buttonSize / 2);

  ctx.strokeStyle = styles.drawingColor;
  ctx.moveTo(centerX - offset, centerY - offset);
  ctx.lineTo(centerX + offset, centerY + offset);

  ctx.moveTo(centerX + offset, centerY - offset);
  ctx.lineTo(centerX - offset, centerY + offset);
  ctx.stroke();
  ctx.restore();
}
