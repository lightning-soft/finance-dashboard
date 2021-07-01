import { Cell } from 'data-grid';

const circleRadius = 5;
const textLeftMargin = 4;
const leftMargin = 4;
const triangleOffset = 2.5;
const triangleYOffset = 2;

const expandedStyles = {
  circleBackground: 'rgba(255,255,255, 0.15)',
  triangleBackground: 'rgba(208, 208, 210, 1)',
};

const regularStyles = {
  circleBackground: 'rgba(255,255,255, 0.075)',
  triangleBackground: 'rgba(208, 208, 210, 0.5)',
};

export class SymbolCell extends Cell {
  private _expanded = false;
  private _showDrawings = false;
  styles = regularStyles;
  centerX: number;
  centerY: number;

  updateValue(value: string) {
    this.value = value;
    this.drawed = false;
  }

  clickOnExpand(mouseEvent: MouseEvent): boolean {
    return this.isClickedOnCircle(mouseEvent);
  }

  getLeftPadding() {
    return leftMargin + (circleRadius * 2) + textLeftMargin;
  }

  setExpanded(value) {
    this._expanded = value;
    this.styles = value ? expandedStyles : regularStyles;
    this.drawed = false;
  }

  setShowDrawings(value: boolean) {
    if (value == this._showDrawings)
      return;

    this._showDrawings = value;
    this.drawed = false;
  }

  draw(context) {
    const ctx: CanvasRenderingContext2D = context?.ctx;

    if (!ctx)
      return;

    const x = context.x;
    const y = context.y + 1;
    const height = context.height;

    if (this._showDrawings) {
      const prevFill = ctx.fillStyle;
      ctx.beginPath();
      ctx.fillStyle = this.styles.circleBackground;
      this.centerX = x + leftMargin + circleRadius;
      this.centerY = y + (height / 2);
      ctx.arc(this.centerX, this.centerY, circleRadius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();


      ctx.beginPath();
      ctx.fillStyle = this.styles.triangleBackground;

      if (this._expanded)
        drawExpandedTriangle(ctx, this.centerX, this.centerY);
      else
        drawRegularTriangle(ctx, this.centerX, this.centerY);

      ctx.fill();
      ctx.fillStyle = prevFill;
      ctx.closePath();
    }


    ctx.fillText(this.value, x + textLeftMargin + leftMargin + (circleRadius * 2), y + (height / 2));
    return true;
  }

  private isClickedOnCircle(mouseEvent: MouseEvent) {
    const { offsetX: x, offsetY: y } = mouseEvent;
    return this._showDrawings && (x <= this.centerX + circleRadius) && (x >= this.centerX - circleRadius) &&
      (y <= this.centerY + circleRadius) && (y >= this.centerY - circleRadius);
  }
}

function drawExpandedTriangle(ctx, centerX, centerY) {
  ctx.moveTo(centerX - triangleOffset, centerY - triangleYOffset);
  ctx.lineTo(centerX + triangleOffset, centerY - triangleYOffset);
  ctx.lineTo(centerX, centerY + triangleYOffset);
  ctx.lineTo(centerX - triangleOffset, centerY - triangleYOffset);
}

function drawRegularTriangle(ctx, centerX, centerY) {
  ctx.moveTo(centerX - triangleYOffset, centerY - triangleOffset);
  ctx.lineTo(centerX + triangleYOffset, centerY);
  ctx.lineTo(centerX - triangleYOffset, centerY + triangleOffset);
  ctx.lineTo(centerX - triangleYOffset, centerY - triangleOffset);
}

