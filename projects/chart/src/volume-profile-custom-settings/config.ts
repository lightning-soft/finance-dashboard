import {
  FieldConfig,
  getCheckboxes,
  getColor,
  getColorSelect,
  getHotkey,
  getNumber,
  getSelect,
  getTextAlign
} from 'dynamic-form';
import { getGraphicsField, getInnerValueArea } from '../indicators/fields';

export const customVolumeProfile = [
  new FieldConfig({
    label: 'General',
    key: 'general',
    fieldGroupClassName: 'two-rows d-grid hide-border-bottom',
    fieldGroup: [
      getSelect({
        key: 'type', label: 'Profile Type',
        className: 'profile-type-select',
        options: [
          {
            value: 'volume',
            label: 'Volume'
          },
          {
            value: 'buyVolume',
            label: 'Buy Volume'
          },
          {
            value: 'sellVolume',
            label: 'Sell Volume'
          },
          {
            value: 'tradesCount',
            label: 'Ticks'
          },
        ],
      }),
      getNumber({ label: 'Value Area, %', key: 'va', min: 0, max: 100 }),
      getTextAlign('align', 'Profile Alignment',
        { className: 'profile-alignment' }),
      {},
      getHotkey({ label: 'Draw VPC', extraConfig: { className: 'profile-hotkey' }, key: 'drawVPC' }),
    ],
  }),
  new FieldConfig({
    label: 'Profile Settings',
    key: 'profileSettings',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'two-rows d-grid',
    fieldGroup: [
      getColorSelect({
        key: 'color',
        label: 'Profile Type',
        className: 'd-flex flex-column justify-content-end',
        options: [
          {
            label: 'Profile Color',
            value: { type: 'profileColor', value: '#a0a0a0' },
          },
          {
            label: 'Heat Map',
            value: { type: 'heatMap', value: '#a0a0a0' },
          },
          {
            label: 'Custom Blend',
            value: { type: 'customBlend', value: '#a0a0a0' },
          },
          {
            label: 'FP Shading',
            value: { type: 'fpShading', value: '#a0a0a0' },
          }
        ]
      }),
      getColor('Profile Color'),
      getNumber({ label: 'Profile width, %', min: 1, key: 'width', }),
      {},
      getNumber({
        label: 'Inside VA Opacity,%',
        min: 1,
        max: 100,
        className: 'centralize-number',
        key: 'insideVAOpacity',
      }),
      getNumber({
        label: 'Outside VA Opacity,%',
        min: 1,
        max: 100,
        className: 'centralize-number',
        key: 'outsideVAOpacity',
      }),
    ],
  }),
  new FieldConfig({
    label: 'POC and Value Area Lines',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'd-grid two-rows',
    key: 'areaLines',
    fieldGroup: [
      {
        wrappers: ['form-field'],
        className: 'hide-border-bottom regular-label single-label label-text-end',
        templateOptions: {
          label: 'POC'
        },
      },
      {
        className: 'hide-border-bottom regular-label single-label label-text-end',
        wrappers: ['form-field'],
        templateOptions: {
          label: 'Value Area (VA)'
        },
      },
      {
        className: 'full-width',
        fieldGroup: [
          getInnerValueArea('Current', 'current'),
          getInnerValueArea('Developing', 'developing')],
      },
      {
        className: 'full-width',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ label: 'Show POC Price', value: 'showPocPrice' }],
            extraConfig: { fieldGroupClassName: 'd-flex justify-content-end', className: 'full-width' }
          }),
          getCheckboxes({
            checkboxes: [{ label: 'Show VA Prices ', value: 'showVAPrice' }],
            extraConfig: { fieldGroupClassName: 'd-flex justify-content-end' }
          })],
        fieldGroupClassName: 'd-grid three-rows'
      },

    ],
  }),
  new FieldConfig({
    key: 'graphics',
    label: 'Graphics',
    className: 'mt-4 mb-3 d-block',
    fieldGroupClassName: 'd-grid two-rows',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [
          {
            label: 'Summary: Enabled',
            key: 'summaryEnabled'
          },
          {
            label: 'Show Hi/Lo Prices',
            key: 'showPrices',
          }
        ],
        extraConfig: {
          className: 'full-width',
          fieldGroupClassName: 'd-grid two-rows p-0'
        },
      }),
      getGraphicsField(),
    ]
  }),
];
