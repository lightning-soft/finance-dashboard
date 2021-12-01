import { IHistogramSettings } from './histogram.cell';
import { TotalCell } from './total.cell';
import { HistogramOrientation } from 'dynamic-form';
import { isInTimeRange } from 'session-manager';

interface IVolumeSettings extends IHistogramSettings {
  sessions: any;
}

export class VolumeCell extends TotalCell {
  ethVolume: number;
  volumeItems = [];

  private _maxEthVolume: number;
  settings: IVolumeSettings;

  public static drawETH(ctx, currentVolumeCell: VolumeCell, prevVolumeCell: VolumeCell, nextVolumeCell: VolumeCell,
                        height, y, width, x) {
    const { ethVolume, settings, _maxEthVolume } = currentVolumeCell;
    if (!ethVolume || !settings.sessions.histogramEnabled || !_maxEthVolume) {
      currentVolumeCell.drawed = true;
      return;
    }

    ctx.strokeStyle = settings.sessions.overlayLineColor;

    const isRightOrientation = settings.histogramOrientation === HistogramOrientation.Right;
    if (isRightOrientation)
      drawRightHistogram(ctx, x, width, y, height, ethVolume, _maxEthVolume, prevVolumeCell?.ethVolume, nextVolumeCell?.ethVolume);
    else
      drawLeftHistogram(ctx, x, width, y, height, ethVolume, _maxEthVolume, prevVolumeCell?.ethVolume, nextVolumeCell?.ethVolume);

  }

  setMaxEthVolume(value) {
    if (value !== this._maxEthVolume) {
      this._maxEthVolume = value;
      this.drawed = false;
    }
  }

  updateValue(value: number, date: any) {
    let changedEth = false;
    let changedRth = false;
    const sessions = this.settings.sessions;

    this.addToHistoryItem(value, date);

    if (isInTimeRange(date, sessions?.eth)) {
      this._addEthVolume(value);
      changedEth = true;
    }

    if (isInTimeRange(date, sessions?.rth)) {
      changedRth = super.updateValue(value);
    }

    return changedEth || changedRth;
  }

  private addToHistoryItem(value: number, date: Date) {
    if (!this.volumeItems.length) {
      this.volumeItems.push({ volume: value, date });
      return;
    }

    const lastItem = this.volumeItems[this.volumeItems.length - 1];
    if (date > lastItem.date) {
      if (lastItem.date.getMinutes() === date.getMinutes()) {
        lastItem.volume += value;
      } else {
        this.volumeItems.push({ volume: value, date });
      }
    }
  }



  recalculateVolume() {
    let volume = 0;
    let sessionVolume = 0;
    const sessions = this.settings.sessions;
    this.volumeItems.forEach(item => {
      if (isInTimeRange(item.date, sessions?.rth)) {
        volume += item.volume;
      }
      if (isInTimeRange(item.date, sessions?.eth)) {
        sessionVolume += item.volume;
      }
    }, 0);
    this.reset(volume);
    this.resetSessionVolume(sessionVolume);
  }

  clear() {
    super.clear();
    this.ethVolume = 0;
    this._maxEthVolume = 0;
    this._value = 0;
    this.volumeItems = [];
  }

  resetSessionVolume(value: number) {
    this.ethVolume = value;
    this.drawed = false;
  }

  private _addEthVolume(volume: number) {
    this.ethVolume += volume;
    this.drawed = false;
  }
}



function drawRightHistogram(ctx, x, width, y, height, ethVolume, _maxEthVolume, prevEthVolume, nextEthVolume) {
  const startX = x + width - (width * ethVolume / _maxEthVolume);
  if (prevEthVolume != null) {
    const endX = x + width;
    const prevX = endX - (width * (prevEthVolume / _maxEthVolume));
    ctx.moveTo(prevX, y);
    ctx.lineTo(startX, y);
  } else {
    ctx.moveTo(startX, y);
  }
  ctx.lineTo(startX, y + height);
  if (nextEthVolume == null)
    ctx.lineTo(startX + width, y + height);
}

function drawLeftHistogram(ctx, x, width, y, height, ethVolume, _maxEthVolume, prevEthVolume, nextEthVolume) {
  const endX = x + (width * ethVolume / _maxEthVolume);
  if (prevEthVolume != null) {
    const startX = x + (width * prevEthVolume / _maxEthVolume);
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  } else {
    ctx.moveTo(x, y);
  }
  ctx.lineTo(endX, y + height);
  if (nextEthVolume == null)
    ctx.lineTo(x, y + height);
}
