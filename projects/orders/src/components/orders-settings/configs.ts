import { FieldConfig, getColor, getLabel, getRadio } from 'dynamic-form';

export const settingsField = [
  new FieldConfig({
    key: 'colors',
    label: 'Colors',
    fieldGroupClassName: 'd-grid two-rows',
    fieldGroup: [
      getColor({ key: 'buyTextColor', label: 'Buy Row Text Color' }),
      getColor({ key: 'sellTextColor', label: 'Sell Row Text Color' }),
      getColor({ key: 'heldbuyTextColor', label: 'Buy Held Text Color' }),
      getColor({ key: 'heldsellTextColor', label: 'Sell Held Text Color' }),
      getColor({ key: 'inactivebuyTextColor', label: 'Inactive Buy Text Color' }),
      getColor({ key: 'inactivesellTextColor', label: 'Inactive Sell Text Color' }),
    ],
  }),
    new FieldConfig({
      key: 'display',
      label: 'Display',
      className: 'mt-4 d-block',
      fieldGroupClassName: 'd-flex flex-column',
      fieldGroup: [
        getLabel('Timestamp'),
        getRadio('timestamp', ['Seconds', 'Milliseconds']),
      ],
    }),
];

export const defaultSettings = {
  colors: {
    buyTextColor: '#0C62F7',
    sellTextColor: 'rgba(220, 50, 47, 1)',
    heldbuyTextColor: 'rgba(12,98,247,0.8)',
    heldsellTextColor: 'rgba(220, 50, 47, 0.8)',
    inactivebuyTextColor: 'rgba(12,98,247,0.4)',
    inactivesellTextColor: 'rgba(220, 50, 47, 0.4)',
  },
  display: {
    timestamp: 'Milliseconds',
  }
};
