import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Storage } from 'storage';
import { NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown/dropdown-menu.component';
import { NzContextMenuService } from 'ng-zorro-antd';

const colorsHistoryKey = 'colorsHistory';

enum ColorType {
  HEX = 'HEX',
  RGB = 'RGB'
}

type RGB = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

interface IPickedColor {
  hasTransparency: boolean;
  color: string;
  opaqueColor: string;
}

const Palette: string[][] = [
  ['#FFE8E8', '#F68E8E', '#F16E6E', '#E95050', '#EA3939', '#DD2121', '#CB1212', '#BC0606', '#9D0A0A', '#820303'],
  ['#FFE0CF', '#FFBB96', '#FFA16D', '#FF8440', '#FF6C1C', '#FF5A00', '#E04F00', '#C04400', '#9C3700', '#802D00'],
  ['#FFFAEA', '#FFF6D7', '#FFEEB4', '#FFE68E', '#FFDF6F', '#FFD43E', '#FFC700', '#D3A500', '#AD8700', '#8B6D00'],
  ['#BCFFDF', '#75FFBD', '#00FF85', '#00F27E', '#00DC72', '#00BD62', '#009950', '#007A40', '#006534', '#004A27'],
  ['#CAFFFD', '#B0F0EE', '#70EAE6', '#3AEAE4', '#1CE4DD', '#00E5DD', '#00CFC8', '#00B2AC', '#009691', '#007A76'],
  ['#F0F9FF', '#CEEAFF', '#9FD7FF', '#78C6FF', '#59B9FF', '#29A5FF', '#0094FF', '#0083E2', '#006FBF', '#005B9C'],
  ['#BBD6FF', '#8DBBFF', '#4895F5', '#2669ED', '#1E4EF6', '#0E43FF', '#0033E9', '#0029BC', '#00239E', '#00208F'],
  ['#E4CFFF', '#C597FF', '#8F37FF', '#7A11FF', '#6900EF', '#6000DA', '#5600C5', '#4B00AB', '#400090', '#3E008B'],
  ['#FFDCFB', '#FF8AF3', '#FF42EC', '#FE00E5', '#DE00C8', '#BE00AB', '#9D008E', '#7C0070', '#600056', '#5A0051'],
  ['#FFFFFF', '#E5E5E5', '#CCCCCC', '#B8B8B8', '#999999', '#7F7F7F', '#666666', '#4C4C4C', '#3F3F3F', '#000000'],
];

@UntilDestroy()
@Component({
  selector: 'color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent extends FieldType implements OnInit {

  get currentColor(): string {
    return this.formControl?.value;
  }

  constructor(private storage: Storage,
              private _nzContextService: NzContextMenuService) {
    super();
  }

  readonly palette: string[][] = Palette;
  readonly colorType = ColorType;
  @ViewChild('menu') menu: NzDropdownMenuComponent;

  pickedColorsHistory: IPickedColor[];
  selectedColorType: ColorType;
  opacity = 100;
  inputText: string;
  hideOpacity = false;
  readonly opacityInputFormatter = (opacity: number) => `${opacity}%`;

  ngOnInit() {
    this._setColorTypeByColor(this.currentColor);
    this._setInputValue();
    const colors = this.storage.getItem(colorsHistoryKey) ?? [];
    this.pickedColorsHistory = colors.map(this._transformToHistoryColor);
    this.hideOpacity = this.field.templateOptions?.hideOpacity;
  }

  open(event) {
    this._nzContextService.create(event, this.menu);
  }

  updateValue(color: string, updateHistory = true): void {
    if (this.formControl.disabled)
      return;

    this._setColorTypeByColor(color);
    const alpha = this.selectedColorType === ColorType.RGB ? parseRgbString(color).a : hexToRGB(color).a;
    this.opacity = this._getOpacityByAlpha(alpha);

    if (color !== this.currentColor && updateHistory) {
      this._updatePickedColors(color);
    }

    this.formControl.patchValue(color);
    this._setInputValue();
  }

  handleSelectPaletteColor(color: string): void {
    const isColorHex = isHex(color);
    if (this.selectedColorType === ColorType.HEX) {
      color = isColorHex ? color : RGBStringToHex(color);
    } else {
      color = isColorHex ? HexToRGBString(color) : color;
    }

    this.updateValue(color);
  }

  handleColorTypeChange(type: ColorType): void {
    this.selectedColorType = type;
    const color = type === ColorType.RGB ? HexToRGBString(this.currentColor) : RGBStringToHex(this.currentColor);
    this.updateValue(color, false);
  }

  updateOpacity(): void {
    const alpha = this._getAlphaByOpacity(this.opacity);
    let color: string;
    if (this.selectedColorType === ColorType.RGB) {
      const rgb = parseRgbString(this.currentColor);
      rgb.a = alpha;
      color = RGBToString(rgb);
    } else {
      color = this.currentColor.slice(0, 7) + alphaToHexSuffix(alpha);
    }

    this.formControl.patchValue(color);
    this._setInputValue();
    this._updatePickedColors(color);
  }

  handleInputTextSubmit(): void {
    let text = this.inputText;
    if (this.selectedColorType === ColorType.HEX) {
      text = '#' + text;
      if (isHex(text)) {
        this.updateValue(text);
      } else {
        this._setInputValue();
      }
    } else {
      const rgbColors = text.split(',');
      if (rgbColors.length === 3 && rgbColors.every(c => +c <= 255 && +c >= 0)) {
        const alpha = this._getAlphaByOpacity(this.opacity);
        this.updateValue(`rgb(${text},${alpha})`);
      } else {
        this._setInputValue();
      }
    }
  }

  private _setColorTypeByColor(color: string): void {
    if (isHex(color)) {
      this.selectedColorType = ColorType.HEX;
    } else if (isRGB(color)) {
      this.selectedColorType = ColorType.RGB;
    } else {
      this.selectedColorType = null;
    }
  }

  private _updatePickedColors(color: string): void {
    const sliceStartIndex = this.pickedColorsHistory.length < 10 ? 0 : 1;
    this.pickedColorsHistory = [...this.pickedColorsHistory.slice(sliceStartIndex), this._transformToHistoryColor(color)];
    this.storage.setItem(colorsHistoryKey, this.pickedColorsHistory.map(i => i.color));
  }

  private _setInputValue(): void {
    if (this.selectedColorType === ColorType.HEX) {
      this.inputText = this.currentColor.replace('#', '');
    } else if (this.selectedColorType === ColorType.RGB) {
      const rgb = parseRgbString(this.currentColor);
      this.inputText = `${rgb.r},${rgb.g},${rgb.b}`;
      this.opacity = (rgb.a ?? 1) * 100;
    } else {
      this.inputText = this.currentColor;
    }
  }

  private _transformToHistoryColor(color: string): IPickedColor {
    const rgb = isHex(color) ? hexToRGB(color) : parseRgbString(color);
    const hasTransparency = rgb.a !== 1;
    return {
      hasTransparency,
      color,
      opaqueColor: hasTransparency ? RGBToString({ ...rgb, a: 1 }) : color
    };

  }

  private _getAlphaByOpacity(opacity: number): number {
    return +(opacity / 100).toFixed(2);
  }

  private _getOpacityByAlpha(alpha: number): number {
    return Math.round((alpha ?? 1) * 100);
  }
}

function convertHexUnitTo256(hex: string): number {
  return parseInt(hex.repeat(2 / hex.length), 16);
}

function getAlphaFloat(a: number, alpha: number): number {
  if (typeof a !== 'undefined') {
    return a / 255;
  }
  if ((typeof alpha != 'number') || alpha < 0 || alpha > 1) {
    return 1;
  }
  return alpha;
}

function hexToRGB(hex: string, alpha?: number): RGB {
  if (!isHex(hex))
    throw new Error('Invalid HEX');

  const chunkSize = Math.floor((hex.length - 1) / 3);
  const hexArr = hex.slice(1).match(new RegExp(`.{${chunkSize}}`, 'g'));
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256);
  return { r, g, b, a: Math.round(getAlphaFloat(a, alpha) * 100) / 100 };
}

function alphaToHexSuffix(alpha: number): string {
  return (((alpha ?? 1) * 255) | 1 << 8).toString(16).slice(1);
}

function RGBToHex(rgb: RGB): string {
  const hex =
    (rgb.r | 1 << 8).toString(16).slice(1) +
    (rgb.g | 1 << 8).toString(16).slice(1) +
    (rgb.b | 1 << 8).toString(16).slice(1);

  return '#' + hex + alphaToHexSuffix(rgb.a);
}

function RGBToString(rgb: RGB): string {
  const a = rgb.a ?? 1;
  return `rgb(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

function parseRgbString(color: string): RGB {
  if (!color)
    return null;

  const startDeleteIndex = color.startsWith('rgba') ? 5 : 4;
  const arr = color.substring(startDeleteIndex, color.length - 1)
    .replace(/ /g, '')
    .split(',');

  return { r: +arr[0], g: +arr[1], b: +arr[2], a: +arr[3] ?? 1 };
}

function isHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(color);
}

function isRGB(color: string): boolean {
  return color?.startsWith('rgb');
}

function RGBStringToHex(color: string): string {
  return RGBToHex(parseRgbString(color));
}

function HexToRGBString(color: string): string {
  return RGBToString(hexToRGB(color));
}
