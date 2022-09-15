import { FormlyFieldConfig, FormlyTemplateOptions } from '@ngx-formly/core';
import * as merge from 'deepmerge';
import { FieldType } from './field';

type EjectCssFn = (value: any) => any;

export interface IFieldConfig extends FormlyFieldConfig {
  label?: string;
  getCss?: EjectCssFn;
  fieldGroup?: IFieldConfig[];
}

export class FieldConfig implements IFieldConfig {
  key?: string;
  label?: string;
  fieldGroup?: IFieldConfig[];
  templateOptions?: FormlyTemplateOptions;

  constructor(config: IFieldConfig) {
    Object.assign(this, {
      wrappers: ['form-field'],
      className: 'field-item',
      fieldGroupClassName: 'd-flex flex-wrap two-rows',
      templateOptions: {
        label: config.label,
        ...config.templateOptions,
      },
      ...config,
    });
    if (config.key) {
      this.key = config.key as string;
    } else if (this.templateOptions.label) {
      this.key = generateKeyFromLabel(this.templateOptions.label);
    }
  }

  getCss(value: any): any {

    if (this.key && value) {
      return {
        [` .${ this.key }`]: this.fieldGroup
          .map(i => i.getCss && i.getCss(value[this.key]))
          .filter(Boolean)
          .reduce((acc, k) => merge(acc, k), {}),
      };
    }
  }
}

export function getInput(_config) {
  const config = { label: '', key: '' };
  Object.assign(config, _config);
  const { label, key, ...extraConfig } = config;
  return {
    type: FieldType.Input,
    key,
    templateOptions: {
      label,
    },
    ...extraConfig
  };
}

export function getSelect(_config: any) {
  const config: any = {
    key: '', label: '', options: [], templateConfig: {},
  };
  Object.assign(config, _config);
  return {
    templateOptions: {
      label: config.label,
      options: config.options || [],
      ...config.templateConfig,
      nzOptionHeightPx: 22,
    },
    type: FieldType.Select,
    ...config
  };
}

export function getColumnSelector(config) {
  const {
    key,
    primaryColumnLabel,
    label,
    subLabel,
    secondaryColumnLabel,
    columns,
    secondaryOptions,
    ..._config
  } = config;
  return {
    key,
    type: FieldType.ColumnSelector,
    templateOptions: {
      columns,
      label,
      subLabel,
      primaryColumnLabel,
      secondaryColumnLabel, secondaryOptions,
    },
    ..._config
  };
}

export function generateKeyFromLabel(label) {
  return lowerFirstLetter((label as string).replace(/ /g, ''));
}

export function getHotkey(config: any | string) {
  let label;
  let key;
  let extraConfig = {};
  if (typeof config === 'string') {
    label = config;
    key = generateKeyFromLabel(config);
  } else {
    label = config.label;
    key = config.key;
    extraConfig = config.extraConfig || {};
  }
  return {
    templateOptions: {
      label
    },
    className: 'mt-1 d-block',
    type: FieldType.Hotkey,
    key,
    ...extraConfig,
  };
}

export function getHistogramColor(label = 'Histogram Color', key = 'histogramColor') {
  const histogramBackgroundColor = 'rgba(72,149,245,0.7)';
  return {
    key,
    name: key,
    type: FieldType.Color,
    default: histogramBackgroundColor,
    templateOptions: { label },
  };
}

export function getColor(label: string | any) {
  const _label = typeof label === 'string' ? label : label.label;

  if (!label)
    throw new Error();

  let key = label.key;

  if (!key)
    key = lowerFirstLetter(_label.replace(/ /g, ''));

  return {
    key,
    name: key,
    type: FieldType.Color,
    templateOptions: { label: _label, hideOpacity: label.hideOpacity },
  };
}

export function getDatePicker(key) {
  return {
    type: FieldType.DatePicker,
    key,
  };
}

export function lowerFirstLetter(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function getLabel(label) {
  return {
    type: FieldType.Label,
    templateOptions: {
      label,
    }
  };
}

export function getRadio(key: string, options: { label: string, value: string }[] | string[]) {
  const _options = (options as Array<any>).map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    return item;
  });
  return {
    key,
    type: FieldType.Radio,
    templateOptions: {
      options: _options,
    }
  };
}

export enum HistogramOrientation {
  Left = 'left',
  Right = 'right'
}

export function wrapFullWidth(configField) {
  return wrapWithClass(configField, 'w-100');
}

export function wrapWithClass(configField, className) {
  return { ...configField, className };

}

export function wrapWithConfig(configField, config) {
  return { ...configField, ...config };
}

export function getHistogramOrientation(key: string = 'histogramOrientation', label: string = 'Histogram Orientation'): IFieldConfig {
  return {
    key,
    type: FieldType.Radio,
    className: 'no-underline histogram-orientation',
    templateOptions: {
      label,
      options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]
    },
  };
}

export function getTextAlign(key: string = 'textAlign', label = 'Text align', extraConfig = {}) {
  return {
    key,
    type: FieldType.TextAlign,
    templateOptions: {
      label
    },
    getCss: (value) => ({ 'text-align': (((value && value[key]) ?? 'left') + ' !important') }),
    ...extraConfig,
  };
}

export function getSwitch(key, label, config = {}) {
  return {
    ...config,
    key,
    type: FieldType.Switch,
    templateOptions: {
      label
    },
  };
}

export function getCheckboxes(_config: any) {
  const config = {
    checkboxes: [], label: null,
    additionalFields: [], extraConfig: {}
  };
  Object.assign(config, _config);
  const { label, checkboxes, additionalFields, extraConfig } = config;
  return {
    wrappers: ['form-field'],
    templateOptions: {
      label
    },
    fieldGroupClassName: 'd-flex checkbox-field-group two-rows flex-wrap',
    fieldGroup: [...checkboxes.map(item => {
      const checkboxConfig = item.config || {};
      return {
        key: item.key,
        fieldGroupClassName: 'checkbox-wrapper',
        type: FieldType.Checkbox,
        templateOptions: {
          label: item.label,
          defaultValue: false,
        },
        ...checkboxConfig
      };
    }), ...additionalFields],
    ...extraConfig,
  };
}

export function getSessionSelect(key, label) {
  return {
    type: FieldType.SessionsSelect,
    key,
    templateOptions: {
      label,
    },
  };
}

export function getDataBox(key) {
  return {
    key,
    type: FieldType.DataBox,
    templateOptions: {},
  };
}

export function getColorSelect(_config) {
  const config: any = {
    key: '', label: '', options: [], templateConfig: {},
  };
  Object.assign(config, _config);
  return {
    templateOptions: {
      label: config.label,
      options: config.options || [],
      ...config.templateConfig,
      nzOptionHeightPx: 22,
    },
    type: FieldType.ColorSelect,
    ...config
  };
}

export function getLineSelector(_config) {

  let config = {
    options: []
  };
  config = Object.assign(config, _config);
  return {
    type: FieldType.LineSelector,
    templateOptions: {},
    ...config,
  };
}

export function getNumber(_config: any) {
  const config: any = {
    key: '',
    placeholder: '',
    precision: 5,
    label: null,
    min: null,
    max: null,
  };
  Object.assign(config, _config);
  const { key, important, placeholder, unit, label, ...extraConfig } = config;
  return {
    key,
    type: FieldType.Number,
    templateOptions: {
      placeholder,
      label,
      precision: config.precision,
      min: config.min,
      max: config.max,
    },
    ...extraConfig,
  };
}
