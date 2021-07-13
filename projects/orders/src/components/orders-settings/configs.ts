import { FieldConfig, getColor } from 'dynamic-form';

export const settingsField = [
  new FieldConfig({
    key: 'colors',
    label: 'Colors',
    fieldGroupClassName: 'd-grid two-rows',
    fieldGroup: [
      getColor({ key: 'buyTextColor', label: 'Buy Row Text Color' }),
      getColor({ key: 'sellTextColor', label: 'Sell Row Text Color' }),
      // getColor({ key: 'buyHeldTextColor', label: 'Buy Held Text Color' }),
      // getColor({ key: 'sellHeldTextColor', label: 'Sell Held Text Color' }),
    ],
  }),
/*  new FieldConfig({
    key: 'display',
    label: 'Display',
    className: 'mt-3',
    fieldGroupClassName: 'd-flex flex-column',
    fieldGroup: [
      getLabel('Timestamp'),
      getRadio('timestamp', ['Seconds', 'Miliseconds', 'Microseconds']),
    ],
  }),*/
];

export const defaultSettings = { colors: { buyTextColor: 'rgba(72, 149, 245, 1)', sellTextColor: 'rgba(220, 50, 47, 1)' } };
