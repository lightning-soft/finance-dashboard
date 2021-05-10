import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {SettingsService} from 'settings';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

enum ColorType {
  HEX = 'HEX',
  RGB = 'RGB'
}

type RGBA = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

const Palette: string[][] = [
  ['#FFE8E8', '#F68E8E', '#F16E6E', '#E95050', '#EA3939', '#DD2121', '#CB1212', '#BC0606', '#9D0A0A', '#820303'],
  ['#FFE0CF', '#FFBB96', '#FFA16D', '#FF8440', '#FF6C1C', '#FF5A00', '#E04F00', '#C04400', '#9C3700', '#802D00'],
];

@UntilDestroy()
@Component({
  selector: 'color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent extends FieldType implements OnInit {
  @ViewChild('colorInput') colorInput: ElementRef<HTMLInputElement>;

  readonly palette: string[][] = Palette;
  readonly colorType = ColorType;

  lastPickedColors: string[] = [];
  selectedColorType: ColorType;
  opacity = 100;
  inputValue: string;

  constructor(private settingsService: SettingsService) {
    super();
  }

  ngOnInit() {
    this.selectedColorType = isHex(this.formControl.value) ? ColorType.HEX : ColorType.RGB;
    this._setInputValue();
    this.settingsService.settings
      .pipe(untilDestroyed(this))
      .subscribe((settings) => {
        this.lastPickedColors = settings.lastPickedColors;
      });
  }

  updateValue(color: string): void {
    const startColor = this.formControl.value;

    if (this.formControl.disabled)
      return;

    console.log(this.selectedColorType, isHex(color));
    if (this.selectedColorType === ColorType.HEX) {
      if (isHex(color)) {
        this.formControl.patchValue(color);
      } else {
        const rgb = parseRgbString(color);
        this.formControl.patchValue(rgbToHex(rgb));
      }
      this.opacity = 100;
    } else {
      if (!isHex(color)) {
        this.formControl.patchValue(color);
        this.opacity = parseRgbString(color).a * 100;
      } else {
        const rgb = hexToRgb(color);
        this.formControl.patchValue(rgbToString(rgb));
        this.opacity = 100;
      }
    }

    if (color !== startColor) {
      console.log(color, startColor);
      this._updatePickedColors(color);
    }
    this._setInputValue();
  }

  handleColorTypeChange(type: ColorType): void {
    this.selectedColorType = type;
    this.updateValue(this.formControl.value);
  }

  updateOpacity(): void {
    if (this.selectedColorType === ColorType.RGB) {
      const rgb = parseRgbString(this.formControl.value);
      rgb.a = this.opacity / 100;
      const color = rgbToString(rgb);
      this.formControl.patchValue(color);
      this._setInputValue();
      this._updatePickedColors(color);
    }
  }

  private _updatePickedColors(color: string): void {
    console.log(color);
    if (this.lastPickedColors.length < 10) {
      this.settingsService.updateLastPickedColors([...this.lastPickedColors, color]);
    } else {
      this.settingsService.updateLastPickedColors([...this.lastPickedColors.slice(1), color]);
    }
  }

  private _setInputValue(): void {
    if (this.selectedColorType === ColorType.HEX) {
      this.inputValue = this.formControl.value.replace('#', '');
    } else {
      const rgb = parseRgbString(this.formControl.value);
      this.inputValue = `${rgb.r},${rgb.g},${rgb.b}`;
    }

    if (this.colorInput) {
      this.colorInput.nativeElement.value = this.inputValue;
    }
  }

  handleInputValueChange(color: string): void {
    if (this.selectedColorType === ColorType.HEX) {
      if (isHex('#' + color)) {
        this.updateValue('#' + color);
      } else {
        this._setInputValue();
      }
    } else {
      const rgbColors = color.split(',');
      console.log(color, rgbColors);
      if (rgbColors.length === 3 && rgbColors.every(c => +c <= 255 && +c >= 0)) {
        this.updateValue( `rgb(${color},${this.opacity / 100})`);
      } else {
        this._setInputValue();
      }
    }
  }
}

function hexToRgb(hex: string): { r: number, g: number, b: number, a: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1
  } : null;
}

function rgbToHex(rgb: RGBA): string {
  return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

function rgbToString(rgb: RGBA): string {
  return `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a ?? 1})`;
}

function parseRgbString(color: string): RGBA {
  const arr = color.substring(4, color.length - 1)
    .replace(/ /g, '')
    .split(',');

  return {r: +arr[0], g: +arr[1], b: +arr[2], a: +arr[3] ?? 1};
}

function isHex(hex): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}
