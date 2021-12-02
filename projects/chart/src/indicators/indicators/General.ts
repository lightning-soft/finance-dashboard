import { FieldConfig, getColor, getNumber, getSelect, getSwitch } from 'dynamic-form';
import { Indicator } from './Indicator';

declare const StockChartX;

const styleOptions = [
  {
    value: 'solid',
    label: 'Solid',
  },
  {
    value: 'dash',
    label: 'Dash'
  },
  {
    value: 'dot',
    label: 'Dot'
  },
  {
    value: 'dash-dot',
    label: 'Dash-Dot'
  }
];
const sourceOptions = [
  {
    value: '.open',
    label: 'Open'
  },
  {
    value: '.high',
    label: 'High'
  },
  {
    value: '.close',
    label: 'Close'
  },
  {
    value: '.volume',
    label: 'Volume'
  },
  {
    value: '.weighted',
    label: 'Weighted'
  },
  {
    value: '.typical',
    label: 'Typical'
  },
  {
    value: '.median',
    label: 'Median'
  }
];

const mapToConfigs = (params, name) => {
  let fields = [];
  if (name === StockChartX.VOL.className) {
    fields = [getColor({ label: 'Blocks Color', key: 'Line Color' })];
  } else {
    fields = Object.entries(params).reduce((total, [key, value]) => {
      const searchKey = key.toLowerCase();
      if (searchKey.includes('enabled')) {
        total.push(getSwitch(key, key));
      } else if (searchKey.includes('color') || searchKey.includes('fill')) {
        total.push(getColor({ key, label: key }));
      } else if (typeof value === 'number') {
        total.push(getNumber({ key, label: key, min: 0 }));
      } else if (searchKey.includes('style')) {
        total.push(getSelect({
          className: 'general-indicator-select',
          key, label: key, options: styleOptions,
        }));
      } else if (searchKey === 'source') {
        total.push(getSelect({
          className: 'general-indicator-select',
          key, label: key, options: sourceOptions,
        }));
      } else
        console.log(key, value);
      return total;
    }, []);
  }
  return [new FieldConfig({
    label: 'Settings',
    fieldGroupClassName: 'd-block regular-label hide-border-bottom inline-fields general-fields',
    fieldGroup: fields,
  })];
};

export class General extends Indicator {
  get indicatorSettings() {
    return { settings: this.instance.parameters };
  }

  set indicatorSettings(value) {
    this.instance.parameters = value.settings;
  }

  applySettings(settings: any) {
    this.indicatorSettings = settings;
  }

  constructor(instance) {
    super(instance);
    this.config = mapToConfigs(instance.parameters, instance.constructor.className);
  }
}
