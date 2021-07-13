import { FieldConfig, getColor, wrapWithClass } from 'dynamic-form';

export const fields = [
  new FieldConfig({
    key: 'colors',
    label: 'Colors',
    fieldGroupClassName: 'd-grid two-rows',
    fieldGroup: [
      wrapWithClass(getColor('Text Color'), 'full-width color-50'),

      getColor({ label: 'PL Up Color', key: 'plUpColor' }),
      getColor('Position Long Color'),
      getColor({ label: 'PL Down Color', key: 'plDownColor' }),

      getColor('Position Short Color'),
      getColor({ label: 'PL Text Color', key: 'plTextColor' }),
      getColor('Position Text Color'),

      getColor({ label: 'Realized PL(R/PL) Up Color', key: 'realizedUpColor' }),
      getColor({ label: 'Floating PL(R/PL) Up Color', key: 'floatingUpColor' }),
      getColor({ label: 'Realized PL(R/PL) Down Down', key: 'realizedDownColor' }),
      getColor({ label: 'Floating PL(R/PL) Up Color', key: 'floatingDownColor' }),

      getColor({ label: 'Realized PL(R/PL) text Color', key: 'realizedTextColor' }),
      getColor({ label: 'Floating PL(R/PL) text Color', key: 'floatingTextColor' }),
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
export const defaultSettings = {
  colors: {
    floatingDownColor: '#C93B3B',
    floatingTextColor: '#D0D0D2',
    floatingUpColor: '#4895F5',
    plDownColor: '#C93B3B',
    plTextColor: '#D0D0D2',
    plUpColor: '#4895F5',
    positionLongColor: '#4895F5',
    positionShortColor: '#C93B3B',
    positionTextColor: '#D0D0D2',
    realizedDownColor: '#C93B3B',
    realizedTextColor: '#D0D0D2',
    realizedUpColor: '#4895F5',
    textColor: '#D0D0D2',
  },
  display: {
    timestamp: 'Miliseconds'
  }
};
