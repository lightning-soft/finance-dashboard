import {
  FieldConfig,
  FieldType,
  getCheckboxes,
  getColor,
  getColorSelect,
  getDataBox,
  getDatePicker,
  getInput,
  getLineSelector,
  getNumber,
  getSelect,
  getSwitch,
  getTextAlign,
  IFieldConfig,
  wrapWithClass,
  wrapWithConfig
} from 'dynamic-form';

const tradingOptions = [
  // {
  //   label: 'New Session',
  //   value: 'newSession'
  // },
  {
    label: 'CME Trading Hours',
    value: [
      {
        startDay: 1,
        startTime: 0,
        endDay: 5,
        endTime: 24 * 3600 * 1000,
      }
    ],
  },
  {
    label: 'Template 2',
    value: [
      {
        startDay: 1,
        startTime: 0,
        endDay: 2,
        endTime: 24 * 3600 * 1000,
      }
    ],
  }
];

function getSessionsSelect(key = 'session', config = { className: 'select full-width session-template' }) {
  return {
    key,
    type: 'sessions-select',
    className: `${ config.className }`,
  };
}

function getProfileConfig(key, _config = {}) {
  const config = {
    additionalElements: [],
  };
  Object.assign(config, _config);
  const { additionalElements, ...extraConfig } = config;
  return {
    key,
    fieldGroupClassName: 'd-grid two-rows p-x-10',
    className: 'profile-settings',
    fieldGroup: [
      ...additionalElements,
      getSelect({
        key: 'type',
        label: 'Profile Type',
        className: 'regular-label label-400 hide-border-bottom profile-type',
        options: [
          { icon: 'icon-hollow-block', value: 'hollowBlocks', label: 'Hollow Blocks' },
          { icon: 'icon-dots-indicator', value: 'dots', label: 'Dots' },
          { icon: 'icon-lines-indicator', value: 'lines', label: 'Lines' },
          { icon: 'icon-hollowgram', value: 'hollowgram', label: 'Hollowgram' },
          { icon: 'icon-solidgram', value: 'solidgram', label: 'Solidgram' },
          { icon: 'icon-filled-line', value: 'filledLine', label: 'Filled Line' },
          { icon: 'icon-hollow-line', value: 'hollowLine', label: 'Hollow Line' },
          { icon: 'icon-solid-block', value: 'solidBlock', label: 'Solid Block' }
        ],
      }),
      getColorSelect({
        key: 'color',
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
      getNumber({ label: 'Profile width, %', min: 1, key: 'width', className: 'split-input full-width' }),
      getCheckboxes({
        checkboxes: [
          {
            label: 'Extend Naked POCs',
            key: 'extendNakedPocs'
          },
        ],
        extraConfig: { className: 'extend-naked-poc', }
      }),
      {
        key: 'extendNaked',
        className: 'full-width',
        fieldGroupClassName: 'd-grid two-rows',
        fieldGroup: [
          getCheckboxes({
            extraConfig: {
              className: '',
              fieldGroupClassName: 'p-0'
            },
            checkboxes: [
              {
                label: 'Extend Naked',
                key: 'enabled',
              }
            ],
          }),
          {
            fieldGroupClassName: 'd-grid line-style-row align-items-center',
            fieldGroup: [
              getSelect({
                key: 'type', options: [
                  { value: 'closes', label: 'Closes' },
                  { value: 'highsLows', label: 'Hi&Lo' },
                  { value: 'closesHighsLows', label: 'Cl,Hi,Lo' }
                ]
              }),
              wrapWithClass(getColor({ key: 'strokeColor', label: '' }), 'stroke-color'),
              getLineSelector({ key: 'strokeTheme' })
            ],
          },
        ]
      },
      wrapWithClass(getNumber({
        key: 'vaInsideOpacity',
        min: 0,
        max: 100,
        label: 'Inside VA Opacity '
      }), 'vaOpacityNumber'),
      wrapWithClass(getNumber({
        key: 'vaOutsideOpacity',
        min: 0,
        max: 100,
        className: 'outsideVa',
        label: 'Outside VA Opacity ',
      }), 'vaOpacityNumber'),
    ],
    ...extraConfig
  };
}

function getShorterConfig(key, _config = {}) {
  const config = {
    additionalElements: [],
  };
  Object.assign(config, _config);
  const { additionalElements, ...extraConfig } = config;
  return {
    key,
    fieldGroupClassName: 'p-x-10',
    className: 'profile-settings',
    fieldGroup: [
      {
        fieldGroupClassName: 'd-grid two-rows',
        fieldGroup: [
          getSessionsSelect(),
          getSelect({
            key: 'type',
            label: 'Profile Type',
            className: 'regular-label label-400 hide-border-bottom profile-type',
            options: [
              { icon: 'icon-hollow-block', value: 'hollowBlocks', label: 'Hollow Blocks' },
              { icon: 'icon-dots-indicator', value: 'dots', label: 'Dots' },
              { icon: 'icon-lines-indicator', value: 'lines', label: 'Lines' },
              { icon: 'icon-hollowgram', value: 'hollowgram', label: 'Hollowgram' },
              { icon: 'icon-solidgram', value: 'solidgram', label: 'Solidgram' },
              { icon: 'icon-filled-line', value: 'filledLine', label: 'Filled Line' },
              { icon: 'icon-hollow-line', value: 'hollowLine', label: 'Hollow Line' },
              { icon: 'icon-solid-block', value: 'solidBlock', label: 'Solid Block' }
            ],
          }),
          getColorSelect({
            key: 'color',
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
        ]
      },
      ...additionalElements,
    ],
    ...extraConfig
  };
}

function getValueArea(key, _config: any = {}) {
  const defaultConfig: any = { extraGroupClass: '', };
  Object.assign(defaultConfig, _config);
  const { extraGroupClass, ...config } = defaultConfig;

  return {
    key,
    fieldGroupClassName: `d-grid three-rows align-items-center ${ extraGroupClass }`,
    wrappers: ['form-field'],
    templateOptions: {
      label: config.label
    },
    fieldGroup: [
      {
        wrappers: ['form-field'],
        className: 'full-width hide-border-bottom regular-label single-label label-text-end',
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
        className: 'span-three-rows',
        fieldGroup: [
          getInnerValueArea('Current', 'current'),
          getInnerValueArea('Previous', 'prev'),
          getInnerValueArea('Dev', 'dev'),
        ]
      },
    ],
    ...config
  };
}

function getInnerValueArea(label, key) {
  return {
    key,
    className: 'mt-2 d-block',
    fieldGroupClassName: 'three-rows d-grid',
    fieldGroup: [
      getCheckboxes({
        label,
        extraConfig: {
          className: 'hideLabel',
        }
      }),
      {
        key: 'poc',
        fieldGroupClassName: 'd-grid inner-value-area',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [
              { key: 'enabled', label: '' },
            ]
          }),
          wrapWithClass(getColor({ key: 'strokeColor', label: '' }), 'stroke-color'),
          getLineSelector({ key: 'strokeTheme' }),
        ]
      },
      {
        key: 'va',
        fieldGroupClassName: 'd-grid inner-value-area',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [
              { key: 'enabled', label: '' },
            ]
          }),
          wrapWithClass(getColor({ key: 'strokeColor', label: '' }), 'stroke-color'),
          getLineSelector({ key: 'strokeTheme' })]
      }
    ]
  };
}

function pocAndValue(label, key) {
  return {
    key,
    className: 'mt-2 d-block',
    fieldGroupClassName: 'three-rows d-grid',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [
          {
            key: 'enabled', label,
          },
        ]
      }),
      {
        fieldGroupClassName: 'd-grid inner-value-area',
        fieldGroup: [
          wrapWithClass(getColor({ key: 'strokeColor', label: '' }), 'stroke-color'),
          wrapWithConfig(getLineSelector({ key: 'strokeTheme' }), {
            className: 'ml-2',
          }),
        ]
      },
      getSwitch('labelEnabled', 'Label'),
    ]
  };
}

function getWidthField(key = 'width') {
  return new FieldConfig({
    key,
    wrappers: [],
    fieldGroupClassName: 'd-grid width-row',
    fieldGroup: [getNumber({
      key: 'value',
      label: 'Width',
      min: 1,
      className: 'calculate-profiles'
    }),
      getSelect({
        key: 'unit',
        className: 'width-select',
        options: [
          {
            label: 'px',
            value: 'pixel',
          },
          {
            label: '%',
            value: 'percent',
          }
        ],
      })],
  });
}

function getBand(key) {
  return {
    key,
    fieldGroupClassName: 'd-grid band-rows',
    fieldGroup: [
      getCheckboxes({ checkboxes: [{ label: `Bands at` }] }),
      getNumber({
        key: 'stdDev', label: 'StdDev',
        className: 'reverse-number-label regular-number-label',
        min: 1,
      }),
      wrapWithClass(getColor('Color'), 'color-without-label'),
      getLineSelector({ key: 'line' }),
    ]
  };
}

function getSessionLine(key, label) {
  return {
    key,
    fieldGroupClassName: 'd-grid liner-rows regular-label label-400 hide-border-bottom',
    className: 'mt-2',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [
          { label, key: 'enabled' }
        ],
      }),
      {
        fieldGroupClassName: 'd-flex align-items',
        fieldGroup: [
          wrapWithClass(getColor('strokeColor'), 'color-without-label'),
          wrapWithClass(getLineSelector({ key: 'strokeTheme' }), 'ml-2 min-width-80'),
        ],
      },
      getCheckboxes({
        checkboxes: [
          { label: 'Dev', key: 'devEnabled' }
        ],
        extraConfig: {
          fieldGroupClassName: '',
        },
      }),
      getSwitch('labelEnabled', 'Label')
    ],
  };
}

export function getMeasureField(key, label) {
  return {
    key,
    fieldGroupClassName: 'd-grid two-rows',
    fieldGroup: [
      getNumber({ key: 'value', label }),
      getSelect({
        key: 'unit',
        className: 'select',
        options: [{
          label: 'px',
          value: 'pixel'
        }, {
          label: '%',
          value: 'percent',
        }]
      }),
    ],
  };
}

export const footprintConfig: IFieldConfig[] = [
  new FieldConfig({
    key: 'main',
    label: 'Main Properties',
    fieldGroupClassName: 'd-grid two-rows p-x-10',
    fieldGroup: [
      getColor({ key: 'fillColor', label: 'Background Color' }),
      wrapWithClass(getColor({ key: 'strokeColor', label: 'Background Outline Color' }), 'background-outline'),
      getColor({ key: 'barStrokeColor', label: 'Bar Outline Color' }),
      getColor({ key: 'closeOpenColor', label: 'SideBar CL\t> OP' }),
      getColor({ key: 'openCloseColor', label: 'SideBar OP\t> CL' }),
      getSelect({
        key: 'mode', label: 'Mode', options: [
          {
            value: 'volume',
            label: 'Volume'
          },
          {
            value: 'tradesCount',
            label: 'Ticks'
          }
        ],
        className: 'select full-width'
      }),
      {
        className: 'w-100  full-width',
        key: 'customTickSize',
        fieldGroupClassName: 'd-grid two-rows',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{
              label: 'Use custom tick size',
              key: 'enabled'
            }]
          }),
          wrapWithConfig(getNumber({ label: 'Ticks per price', key: 'value', min: 1, }),
            { className: 'tickPerPrice' }),
        ],
      },
    ],
  }),
  new FieldConfig({
    key: 'font',
    label: 'Font',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'd-grid two-rows p-x-10',
    fieldGroup: [
      getSelect({
        key: 'fontFamily', options: [{
          value: 'Open Sans',
          label: 'Open Sans'
        },
          {
            value: 'Monospace',
            label: 'Monospace',
          }
        ],
        className: ''
      }),
      getSelect({
        key: 'fontWeight', options: [{
          value: '400',
          label: 'Regular'
        },
          {
            value: '700',
            label: 'Bold'
          }
        ]
      }),
      getNumber({ key: 'fontSize', min: 1, className: 'number-full-width' }),
      getColor({ key: 'fillColor', label: 'Text Color' }),
    ]
  }),
  new FieldConfig({
    key: 'intraBar',
    label: 'IntaBar',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'd-grid two-rows hide-border-bottom p-x-10',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [{
          key: 'useDeltaShadingColors',
          label: 'Use DeltaShadingColors'
        }],
        label: 'Bar Style',
        extraConfig: {
          className: 'regular-label',
        }
      }),
      getSelect({
        key: 'barStyle', options: [
          { label: 'Volume Profile Bars', value: 'volumeProfileBars' },
          { label: 'No Bars', value: 'noBars' },
          { label: 'Delta Print Bars', value: 'deltaPrintBars' },
          { label: 'Delta Shading Bars', value: 'deltaShadingBars' },
        ]
      }),
      wrapWithConfig(getColor({ key: 'sellShadeBarColor', label: 'Sell Shade Bar Color' }), {
        hideExpression: '!["volumeProfileBars", "deltaShadingBars"].includes(model.barStyle)'
      }),
      wrapWithConfig(getColor({ key: 'buyShadeBarColor', label: 'Buy Shade Bar Color' }), {
        hideExpression: '!["volumeProfileBars", "deltaShadingBars"].includes(model.barStyle)'
      }),
      wrapWithConfig(getColor({ key: 'barColor', label: 'Profile Bars Color' }), {
        hideExpression: 'model.barStyle !== "volumeProfileBars"',
      }),
      wrapWithConfig(getColor({ key: 'barPocColor', label: 'Profile Bars V POC Color' }), {
        hideExpression: 'model.barStyle !== "volumeProfileBars"'
      }),

      wrapWithConfig(getColor({ key: 'sellVolumeBarColor', label: 'Sell Volume Bar Color' }), {
        hideExpression: 'model.barStyle !== "deltaPrintBars"'
      }),
      wrapWithConfig(getColor({ key: 'sellPocBarColor', label: 'Sell VPOC Bar Color' }), {
        hideExpression: 'model.barStyle !== "deltaPrintBars"'
      }),
      wrapWithConfig(getColor({ key: 'buyVolumeBarColor', label: 'Buy Volume Bar Color' }), {
        hideExpression: 'model.barStyle !== "deltaPrintBars"'
      }),
      wrapWithConfig(getColor({ key: 'buyPocBarColor', label: 'Buy VPOC Bar Color' }), {
        hideExpression: 'model.barStyle !== "deltaPrintBars"'
      }),
      wrapWithConfig(getSelect({
        label: 'Bar Alignment',
        key: 'barAlignment',
        className: 'select full-width',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'middle', label: 'Middle' },
          { value: 'right', label: 'Right' },

        ],
      }), {
        hideExpression: 'model.barStyle !== "volumeProfileBars"'
      })

    ]
  }),
  new FieldConfig({
    key: 'text',
    label: 'Text',
    fieldGroupClassName: 'inline-fields regular-label hide-border-bottom p-x-10',
    className: 'mt-4 d-block',
    fieldGroup: [
      getSelect({
        label: 'Text Style',
        key: 'textStyle',
        className: 'select d-block mb-1',
        options: [
          {
            label: 'No Text',
            value: 'noText'
          },
          {
            label: 'Bid Delta Ask',
            value: 'bidDeltaAsk'
          },
          {
            label: 'Bid Total Ask',
            value: 'bidTotalAsk'
          },
          {
            label: 'BidxAsk',
            value: 'bidAsk'
          },

        ]
      }),
      wrapWithConfig(getInput({ label: 'Separator', key: 'separator', className: 'split-input' }), {
        hideExpression: (res) => {
          return res?.textStyle !== 'bidAsk';
        }
      }),
      wrapWithConfig(getNumber({
        label: 'Margin In Px',
        min: 0,
        key: 'margin',
        className: 'split-input'
      }), {
        hideExpression: (res) => {
          return !['bidDeltaAsk', 'bidTotalAsk'].includes(res?.textStyle);
        }
      }),
      getCheckboxes({
        checkboxes: [
          { label: 'Hide Sides', key: 'hideSides' }
        ], extraConfig: {
          hideExpression: (res) => {
            return !['bidDeltaAsk', 'bidTotalAsk'].includes(res?.textStyle);
          }
        }
      }),
      getNumber({ label: 'Initial bar width', min: 1, key: 'initialBarWidth', className: 'split-input d-block my-2' }),
      wrapWithConfig(getNumber({
        label: 'Bar width text threshold',
        min: 1,
        key: 'barWidthTextThreshold',
        className: 'split-input mt-2'
      }), {
        hideExpression: (res) => {
          return res?.textStyle === 'noText';
        }
      }),
    ]
  }),
  new FieldConfig({
    key: 'profile',
    label: 'Profile',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'inline-fields hide-border-bottom p-x-10',
    fieldGroup: [
      getSelect({
        label: 'Profile Filter',
        key: 'profileFilter',
        options: [
          {
            label: 'No Profile Filter',
            value: 'noProfileFilter'
          },
          {
            label: 'Auto Max Profile',
            value: 'autoMaxProfile'
          },
          {
            label: 'Min Volume Profile ',
            value: 'minVolumeProfile'
          },
          {
            label: 'Max Width Profile ',
            value: 'maxWidthProfile'
          },
        ],
        className: 'select'
      }),
      getNumber({
        label: 'Filter Value',
        key: 'filterValue',
        min: 0,
        className: 'split-input',
        hideExpression: (model) => {
          return !['minVolumeProfile', 'maxWidthProfile'].includes(model.profileFilter);
        }
      }),
      wrapWithConfig(getSelect({
        key: 'autoProfilingRange',
        label: 'Auto Profiling Range',
        className: 'select',
        options: [{
          label: 'Visible',
          value: 'visible'
        },
          {
            label: 'Chart',
            value: 'chart'
          }
        ]
      }), {
        hideExpression: model => {
          return model.profileFilter !== 'autoMaxProfile';
        }
      }),
      getCheckboxes({
        checkboxes:
          [{ key: 'showPocOnlyOnBiggestBar', label: 'Show POC Only On Biggest...' }]
      }),
      getNumber({
        label: 'POC Outline Width',
        min: 1,
        key: 'strokeWidth', className: 'split-input d-block mt-1'
      })
    ],
  }),
  new FieldConfig({
    key: 'volumeFilter',
    className: 'mt-4 d-block',
    label: 'Volume Filter',
    fieldGroupClassName: 'inline-fields regular-label hide-border-bottom p-x-10',
    fieldGroup: [
      getSwitch('enabled', 'Enabled'),
      getSelect({
        label: 'Mode', key: 'mode', options: [
          {
            value: 'lessThan',
            label: 'Less than'
          },
          {
            value: 'greaterThan',
            label: 'Greater Than'
          }
        ], className: 'select',
      }),
      getNumber({ label: 'Value', key: 'value', min: 0, className: 'split-input d-block mt-2' })
    ]
  }),
  new FieldConfig({
    key: 'deltaImbalance',
    label: 'Delta Imbalance',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'inline-fields regular-label hide-border-bottom p-x-10',
    fieldGroup: [
      getSwitch('enabled', 'Enabled'),
      getInput({
        key: 'threshold',
        label: 'Threshold, %',
        className: 'split-input'
      }),
      new FieldConfig({
        fieldGroupClassName: 'd-grid two-rows p-0 mt-1',
        fieldGroup: [
          getColor({ key: 'strongBidVolumeColor', label: 'Strong Bid Volume' }),
          getColor({ key: 'strongAskVolumeColor', label: 'Strong Ask Volume' }),
          getColor({ key: 'weakBidVolumeColor', label: 'Weak Bid Volume' }),
          getColor({ key: 'weakAskVolumeColor', label: 'Weak Ask Volume' }),
        ]
      }),
      getCheckboxes({
        checkboxes: [{
          key: 'enableWeakBidVolume',
          label: 'Enable Weak Bid Vol.'
        },
          {
            key: 'enableWeakAskVolume',
            label: 'Enable Weak Ask Vol.'
          }],
        extraConfig: {
          fieldGroupClassName: 'd-grid two-rows'
        }
      })
    ],
  }),
  new FieldConfig({
    key: 'pullback',
    label: 'Pullback',
    className: 'pb-1 mt-4 d-block',
    fieldGroupClassName: 'inline-fields p-0 regular-label p-x-10',
    fieldGroup: [
      getSwitch('enabled', 'Enable Pullback'),
      new FieldConfig({
        fieldGroupClassName: 'd-grid two-rows p-0 mt-2',
        fieldGroup: [
          getColor({ key: 'textColor', label: 'Font' }),
          getColor({ key: 'fillColor', label: 'Background' }),
          getColor({ key: 'currentBidAskColor', label: 'Current Bid/Ask Color' }),
        ]
      })
    ]
  })
];

export const volumeProfileConfig: IFieldConfig[] = [
  new FieldConfig({
    key: 'general',
    label: 'General',
    fieldGroupClassName: 'd-grid two-rows inline-fields hide-border-bottom regular-label p-x-10',
    fieldGroup: [
      {
        key: 'period',
        wrappers: ['form-field'],
        templateOptions: {
          label: 'Profile Period',
        },
        className: 'w-100 full-width profile-period hide-border-bottom ',
        fieldGroupClassName: 'd-flex align-items-end period-items',
        fieldGroup: [
          wrapWithConfig(
            getSelect({
              key: 'type',
              options: [{
                value: 'last',
                label: 'Last'
              },
                {
                  value: 'every',
                  label: 'Every'
                }
              ]
            }), {
              hideExpression: 'model.unit === "toPresent"',
            }),
          wrapWithConfig(getNumber({
            key: 'value',
            min: 0,
          }), {
            hideExpression: 'model.unit === "toPresent"',
          }),
          wrapWithConfig(getDatePicker('date'), {
            hideExpression: 'model.unit !== "toPresent"',
          }),
          getSelect({
            key: 'unit',
            options: [
              {
                value: 'bars',
                label: 'Bars'
              },
              {
                value: 'minute',
                label: 'Minutes'
              },
              {
                value: 'day',
                label: 'Days'
              },
              {
                value: 'week',
                label: 'Weeks'
              },
              {
                value: 'month',
                label: 'Month'
              },
              {
                value: 'quarter',
                label: 'Quarters'
              },
              {
                value: 'year',
                label: 'Years'
              },
              {
                value: 'toPresent',
                label: 'To Present'
              },
              {
                value: 'allBars',
                label: 'All Bars'
              },
              {
                value: 'visibleBars',
                label: 'Visible Bars'
              },
            ],
          }),

        ],
      },
      getSelect({
        key: 'type', label: 'Profile Type',
        className: 'split-select',
        options: [{
          value: 'volume',
          label: 'Volume'
        },
          {
            value: 'tradesCount',
            label: 'Ticks'
          },
          {
            value: 'price',
            label: 'Price'
          },
        ],
      }),
      {
        key: 'hide',
        fieldGroupClassName: 'd-flex',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [
              { label: 'Hide', key: 'enabled' },
            ]
          }),
          getSelect({
            key: 'value',
            className: 'w-100',
            options: [
              {
                value: 'lastProfile',
                label: 'Last Profile'
              },
              {
                value: 'allProfiles',
                label: 'All Profiles'
              },
            ],
          }),
        ],
      },
      getNumber({ label: 'Value Area, %', key: 'va', min: 0, max: 100 }),
      {
        key: 'smoothed',
        fieldGroupClassName: 'd-flex align-items-center smooth-price',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ label: 'Smoothed..', key: 'enabled' }]
          }),
          getNumber({
            key: 'value',
            label: 'Prices',
            min: 0,
          }),
        ],
      },
      getTextAlign('align', 'Profile Alignment',
        { className: 'profile-alignment' }),
      getNumber({
        key: 'calculateXProfiles',
        label: 'Calculate X profiles',
        min: 1,
        className: 'calculate-profiles'
      }),
      {
        className: 'w-100  full-width',
        key: 'customTickSize',
        fieldGroupClassName: 'd-grid two-rows',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{
              label: 'Use custom tick size',
              key: 'enabled'
            }]
          }),
          wrapWithConfig(getNumber({ label: 'Ticks per price', key: 'value', min: 1, }),
            { className: 'tickPerPrice' }),
        ],
      },

    ],
  }),
  new FieldConfig({
    key: 'profile',
    label: 'Profile Settings',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'field-container',
    fieldGroup: [
      {
        fieldGroupClassName: 'd-flex align-items-center',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [
              { key: 'overlayEthOverRth', label: 'Overlay ETH over RTH' },
            ],
            extraConfig: {
              hideExpression: (model) => {
                return !model.splitProfile;
              }
            }
          }),
          getSwitch(
            'splitProfile',
            'Split Profile',
            { className: 'right-switch' },
          ),
        ],
      },
      wrapWithConfig(getProfileConfig('rth'), {
        className: 'block profile-settings',
        hideExpression: (model, formState, config) => {
          return config.form.value.splitProfile;
        }
      }),
      getProfileConfig('rth', {
        additionalElements: [
          getSessionsSelect(),
        ],
        wrappers: ['form-field'],
        templateOptions: {
          label: 'RTH Session'
        },
        className: 'mt-4 block profile-settings bordered',
        hideExpression: (model, formState, config) => {
          return !config.form.value.splitProfile;
        }
      }),
      getProfileConfig('eth', {
        additionalElements: [
          getSessionsSelect(),
        ],
        wrappers: ['form-field'],
        templateOptions: {
          label: 'ETH Session'
        },
        className: 'mt-4 block profile-settings profile-settings-extended bordered',
        hideExpression: (model, formState, config) => {
          return !config.form.value.splitProfile;
        }
      }),
    ],
  }),
  new FieldConfig({
    key: 'lines',
    label: 'POC and Value Area Lines',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'field-container py-0 p-x-10',
    fieldGroup: [
      wrapWithConfig(getValueArea('rth'), {
        hideExpression: (model, formState, config) => {
          return config.form._parent.value.profile.splitProfile;
        }
      }),
      wrapWithConfig(getValueArea('rth', { label: 'RTH Session', extraGroupClass: '' }), {
        className: 'bordered mt-4 block',
        hideExpression: (model, formState, config) => {
          return !config.form._parent.value.profile.splitProfile;
        }
      }),
      wrapWithConfig(getValueArea('eth', { label: 'ETH Session', extraGroupClass: '' }), {
        className: 'mt-4 block bordered',
        hideExpression: (model, formState, config) => {
          return !config.form._parent.value.profile.splitProfile;
        }
      }),
    ],
  }),
  new FieldConfig({
    key: 'graphics',
    label: 'Graphics',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'd-grid two-rows p-x-10',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [
          {
            label: 'Summary: Enabled',
            key: 'summaryEnabled'
          }
        ],
        extraConfig: {
          className: 'full-width',
          fieldGroupClassName: 'd-grid two-rows p-0'
        },
      }),
      new FieldConfig({
        key: 'summaryFont',
        label: 'Summary Font',
        fieldGroupClassName: 'd-grid two-rows p-0',
        className: 'hide-border-bottom regular-label full-width label-400',
        fieldGroup: [
          {
            fieldGroupClassName: 'd-grid two-rows p-0',
            fieldGroup: [
              getSelect({
                key: 'fontFamily',
                className: 'w-100 full-width',
                options: [
                  { label: 'Open Sans', value: 'Open Sans' },
                  { label: 'Monospace', value: 'Monospace' }
                ],
              }),
              getSelect({
                wrappers: [],
                key: 'fontWeight',
                options: [
                  {
                    label: 'Regular',
                    value: '400'
                  },
                  {
                    label: 'Bold',
                    value: '600'
                  },
                  {
                    label: 'Bolder',
                    value: '700'
                  },
                ],
              }),
              getNumber({ key: 'fontSize', min: 1, className: 'full-number-input align-self-end' }),
            ],
          },
          getColor({ key: 'fillColor', label: 'Summary Color' }),
        ],
        // fieldGroupClassName: 'full-width'
      }),
    ],
  })
];

export const compositeProfileConfig: IFieldConfig[] = [
  new FieldConfig({
    key: 'general',
    label: 'General',
    fieldGroupClassName: 'd-grid two-rows inline-fields hide-border-bottom regular-label p-x-10',
    fieldGroup: [
      getSelect({
        key: 'type', label: 'Profile Type',
        className: 'split-select',
        options: [{
          value: 'volume',
          label: 'Volume'
        },
          {
            value: 'tradesCount',
            label: 'Ticks'
          },
          {
            value: 'price',
            label: 'Price'
          },
        ],
      }),
      getNumber({ label: 'Value Area, %', key: 'va', min: 0, max: 100 }),
      getTextAlign('align', 'Profile Alignment',
        { className: 'profile-alignment' }),
      {
        key: 'customTickSize',
        fieldGroup: [
          {
            key: 'enabled',
            value: true
          },
          wrapWithConfig(getNumber({ label: 'Ticks per price', key: 'value', min: 1, }),
            { className: 'tickPerPrice' })
        ]
      },
      getWidthField(),
      {
        key: 'smoothed',
        fieldGroupClassName: 'd-flex align-items-center smooth-price',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ label: 'Smoothed..', key: 'enabled' }]
          }),
          getNumber({
            key: 'value',
            label: 'Prices',
            min: 0,
          }),
        ],
      },
    ],
  }),
  new FieldConfig({
    key: 'profile',
    label: 'Profile Settings',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'field-container',
    fieldGroup: [
      {
        fieldGroupClassName: 'd-flex align-items-center',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [
              { key: 'overlayEthOverRth', label: 'Overlay ETH over RTH' },
            ],
            extraConfig: {}
          }),
        ],
      },
      getShorterConfig('rth', {
        additionalElements: [],
        wrappers: ['form-field'],
        templateOptions: {
          label: 'RTH'
        },
        className: 'mt-4 block profile-settings bordered',
      }),
      getShorterConfig('eth', {
        additionalElements: [],
        wrappers: ['form-field'],
        templateOptions: {
          label: 'ETH Overlay'
        },
        className: 'mt-4 block profile-settings bordered',
        hideExpression: (model, state, field) => {
          return !field.form.value.overlayEthOverRth;
        },
      }),
    ],
  }),
  new FieldConfig({
    key: 'lines',
    label: 'POC and Value Area Lines',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'field-container py-0 p-x-10',
    fieldGroup: [
      pocAndValue('Poc', 'poc'),
      pocAndValue('ValueArea(VA)', 'va'),

    ],
  }),
];

const groupsRows = ['Delta',
  {
    label: 'Volume',
    hasBackground: true
  }, 'Delta day',
  {
    label: 'Buy Volume',
    hasBackground: true
  },
  {
    label: 'Sell Volume', hasBackground: true
  }, { label: 'Delta% Day', key: 'deltaPercentDay', hasBackground: false },
  {
    label: 'Buy% Volume',
    hasBackground: false,
    key: 'buyPercentVolume'
  }, {
    label: 'Sell% Volume', hasBackground: false,
    key: 'sellPercentVolume'
  }, 'Delta Max', 'Delta Min', 'Delta Finish'];

export const barStatsConfig = [
  new FieldConfig({
    key: 'general',
    label: 'General',
    fieldGroupClassName: 'd-grid two-rows inline-fields hide-border-bottom regular-label p-x-10',
    fieldGroup: [
      getNumber({ key: 'rowHeight', label: 'Row Height', min: 0, }),
      {
        className: 'full-width bar-stats-border mt-1 d-block',
        fieldGroupClassName: 'd-grid three-rows',
        fieldGroup: [
          getSelect({ key: 'position', label: 'Position', options: [{ key: 'left', label: 'Left' }] }),
          getColor('Text Color'),
          getColor('Back Color'),
        ],
      },
      {
        className: 'full-width bar-stats-border bar-font-stats-border mt-2 d-block',
        fieldGroupClassName: 'd-grid font-rows',
        fieldGroup: [
          wrapWithClass(getColor('Font Color'), 'color-without-label'),
          getSelect({ key: 'font', options: [{ label: 'Open Sans', key: 'openSans' }] }),
          getSelect({
            key: 'font', options: [
              { key: '400', label: 'Regular' },
              { key: '700', label: 'Bold' },
            ]
          }),
          getNumber({
            key: 'fontSize',
            min: 0,
          })
        ],
      },
    ],
  }),
  new FieldConfig({
    key: 'groupsRows',
    label: 'Groups rows',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'd-flex flex-column',
    fieldGroup: [
      {
        templateOptions: {
          dragPreviewClass: 'group-preview-class',
        },
        type: FieldType.DragAndDrop,
        fieldGroup: groupsRows.map(item => getGroupRow(item)),
      },
      wrapWithClass(getCheckboxes({ checkboxes: [{ key: 'ticks', label: 'Ticks' }] }), 'mt-1'),
    ],
  }),
  new FieldConfig({
    label: 'Groups with a trade volume filter',
    key: 'groupsTradeVolumeFilter',
    fieldGroupClassName: '',
    fieldGroup: [
      {
        type: 'repeat-group',
        templateOptions: {
          addText: 'Add',
        },
        fieldArray: {
          className: 'mt-1 d-block',
          fieldGroupClassName: 'd-grid group-row',
          fieldGroup: [
            getInput({ key: 'name' }),
            getNumber({ min: 0, key: 'min' }),
            getNumber({ min: 0, key: 'max' }),
          ],
        },
      }
    ],
  }),
];


function getGroupRow(title) {
  const label = typeof title === 'string' ? title : title.label;
  const key = title.key ?? label.toLowerCase().replace(/ /g, '');
  const hasBackground = (title as { hasBackground }).hasBackground;
  const colors = hasBackground ? [getColor('Background')] : [getColor('Positive'),
    getColor('Negative')];
  return {
    key,
    fieldGroupClassName: 'd-grid three-rows',
    className: '',
    fieldGroup: [
      getCheckboxes({ checkboxes: [{ key: 'enabled', label }] }),
      ...colors,
    ],
  } as any;
}

export const priceStatsConfig: IFieldConfig[] = [
  new FieldConfig({
    key: 'general',
    label: 'General',
    fieldGroupClassName: 'd-grid two-rows inline-fields hide-border-bottom regular-label p-x-10',
    fieldGroup: [
      getSelect({
        key: 'type', label: 'Profile Type',
        className: 'split-select',
        options: [{
          value: 'volume',
          label: 'Volume'
        },
          {
            value: 'tradesCount',
            label: 'Ticks'
          },
          {
            value: 'price',
            label: 'Price'
          },
        ],
      }),
      getNumber({ label: 'Value Area, %', key: 'va', min: 0, max: 100 }),
      getTextAlign('align', 'Profile Alignment',
        { className: 'profile-alignment' }),
      {
        key: 'customTickSize',
        fieldGroup: [
          {
            key: 'enabled',
            value: true
          },
          wrapWithConfig(getNumber({ label: 'Ticks per price', key: 'value', min: 1, }),
            { className: 'tickPerPrice' }),
        ]
      },
      new FieldConfig({
        key: 'sessions',
        wrappers: [],
        fieldGroupClassName: 'd-block bordered mt-3',
        className: 'full-width',
        fieldGroup: [
          {
            key: 'current',
            fieldGroupClassName: 'd-grid two-rows',
            fieldGroup: [
              getCheckboxes({
                checkboxes: [
                  { label: 'Current Session', key: 'enabled' },
                ],
              }),
              getWidthField(),
            ]
          },
          {
            key: 'prev',
            fieldGroupClassName: 'd-grid two-rows mt-2',
            fieldGroup: [
              getCheckboxes({
                checkboxes: [
                  { label: 'Previous Session', key: 'enabled' },
                ],
              }),
              getWidthField(),
            ]
          },
          {
            key: 'days',
            fieldGroupClassName: 'd-grid two-rows mt-2',
            fieldGroup: [
              getCheckboxes({
                checkboxes: [{
                  label: '',
                  key: 'enabled',

                }],
                additionalFields: [
                  getNumber({
                    key: 'count',
                    label: 'Days',
                    className: 'reverse-number-label regular-number-label',
                    min: 1
                  })
                ]
              }),
              getWidthField(),
              getSwitch('includeCurrentSession', 'Include Current Session', { className: 'regularSwitch reverse-switch-label' })
            ]
          }
        ],
      }),
    ],
  }),
  new FieldConfig({
    key: 'profile',
    label: 'Profile Settings',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'field-container',
    fieldGroup: [
      {
        fieldGroupClassName: 'd-flex align-items-center',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [
              { key: 'overlayEthOverRth', label: 'Overlay ETH over RTH' },
            ],
            extraConfig: {}
          }),
        ],
      },
      getShorterConfig('rth', {
        additionalElements: [
          {
            key: 'poc',
            fieldGroupClassName: 'd-grid two-rows mt-2',
            fieldGroup: [
              getCheckboxes({
                checkboxes: [
                  { key: 'enabled', label: 'POC Chart Overlay' },
                ],
                additionalFields: [
                  getSwitch('devEnabled', 'Developing POC', { className: 'regularSwitch reverse-switch-label mt-n2' }),
                ],
              }),
              getColor({ key: 'strokeColor', label: 'POC Color' }),
            ]
          },
          {
            key: 'va',
            fieldGroupClassName: 'd-grid two-rows mt-2',
            fieldGroup: [
              getCheckboxes({
                checkboxes: [
                  { key: 'enabled', label: 'VA Chart Overlay' },
                ],
                additionalFields: [
                  getSwitch('devEnabled', 'Developing VA', { className: 'regularSwitch reverse-switch-label mt-n2' }),
                ],
              }),
              getColor({ key: 'strokeColor', label: 'VA Color' }),
            ]
          }
        ],
        wrappers: ['form-field'],
        templateOptions: {
          label: 'RTH',
        },
        className: 'mt-4 block profile-settings bordered',
      }),
      getShorterConfig('eth', {
        hideExpression: (model, state, field) => {
          return !field.form.value.overlayEthOverRth;
        },
        additionalElements: [
          {
            key: 'poc',
            fieldGroupClassName: 'd-grid two-rows mt-2',
            fieldGroup: [
              getCheckboxes({
                checkboxes: [
                  { key: 'enabled', label: 'POC Chart Overlay' },
                ],
                additionalFields: [
                  getSwitch('dev', 'Developing POC', { className: 'regularSwitch reverse-switch-label mt-n2' }),
                ],
              }),
              getColor({ key: 'strokeColor', label: 'POC Color' }),
            ]
          },
          {
            key: 'va',
            fieldGroupClassName: 'd-grid two-rows mt-2',
            fieldGroup: [
              getCheckboxes({
                checkboxes: [
                  { key: 'enabled', label: 'VA Chart Overlay' },
                ],
                additionalFields: [
                  getSwitch('va', 'Developing VA', { className: 'regularSwitch reverse-switch-label mt-n2' }),
                ],
              }),
              getColor({ key: 'strokeColor', label: 'VA Color' }),
            ]
          }
        ],
        wrappers: ['form-field'],
        templateOptions: {
          label: 'ETH Overlay',
        },
        className: 'mt-4 block profile-settings bordered',
      }),

    ],
  }),
  new FieldConfig({
    key: 'highlight',
    label: 'POC and Value Area Profile Highlight',
    className: 'mt-3 d-block',
    fieldGroupClassName: '',
    fieldGroup: [
      {
        key: 'poc',
        fieldGroupClassName: 'd-grid two-rows',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{
              key: 'enabled',
              label: 'POC',
            }]
          }),
          getColor({ key: 'value', label: 'Highlight POC Color' }),
        ],
      },
      {
        key: 'va',
        fieldGroupClassName: 'd-grid two-rows mt-2',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{
              key: 'enabled',
              label: 'Value area(VA)',
            }]
          }),
          getColor({ key: 'value', label: 'Highlight VA Color' }),
        ],
      },
    ],
  }),
];

const sessionsItems = [
  { key: 'rthHigh', label: 'RTH High' },
  { key: 'rthLow', label: 'RTH Low' },
  { key: 'ethHigh', label: 'ETH High' },
  { key: 'ethLow', label: 'ETH Low' },
  { key: 'ibHigh', label: 'IB High' },
  { key: 'ibLow', label: 'IB Low' },
  { key: 'prevRthHigh', label: 'PREV RTH High' },
  { key: 'prevRthLow', label: 'PREV RTH Low' },
  { key: 'rthMid', label: 'RTH Mid' },
  { key: 'ethMid', label: 'ETH Mid' },
  { key: 'rthSettle', label: 'RTH Settle' },
  { key: 'rthOpen', label: 'RTH Open' },
  { key: 'prevWkHigh', label: 'Prev Wk High' },
  { key: 'prevWkLow', label: 'Prev Wk Low' },
];

export const sessionStatsConfig: IFieldConfig[] = [
  new FieldConfig({
    label: 'General',
    key: 'general',
    fieldGroupClassName: 'd-grid two-rows regular-label label-400 hide-border-bottom',
    fieldGroup: [
      getSelect({
        key: 'style',
        label: 'Visual style',
        className: 'full-width select visual-style-width',
        options: [
          {
            label: 'Line',
            value: 'line'
          },
          {
            label: 'Block',
            value: 'block'
          }
        ]
      }),
      getMeasureField('width', 'Width'),
      getMeasureField('margin', 'Margin'),
    ],
  }),
  new FieldConfig({
    label: 'Font',
    key: 'font',
    fieldGroupClassName: 'd-grid font-rows regular-label label-400 hide-border-bottom',
    className: 'mt-4 d-block',
    fieldGroup: [
      wrapWithClass(getColor({ key: 'fillColor', label: '' }), 'color-without-label'),
      getSelect({
        key: 'fontFamily',
        options: [{ label: 'Open Sans', value: 'Open Sans' },
          { label: 'Monospace', value: 'monospace' },
          { label: 'Sans Serif', value: 'sans-serif' }]
      }),
      getSelect({
        key: 'fontWeight',
        options: [{ label: 'Regular', value: '400' },
          { label: 'Bold', value: '600' },
        ]
      }),
      getNumber({
        key: 'fontSize'
      })
    ],
  }),
  new FieldConfig({
    label: 'Trading Hours',
    key: 'sessions',
    className: 'mt-4 d-block',
    fieldGroupClassName: 'd-grid two-rows regular-label label-400 hide-border-bottom',
    fieldGroup: [
      wrapWithConfig(getSessionsSelect('rth'), {
        label: 'RTH Session Template'
      }),
      wrapWithConfig(getSessionsSelect('eth'), {
        label: 'ETH Session Template'
      }),
    ],
  }),
  new FieldConfig({
    label: 'Lines',
    className: 'mt-4 d-block',
    key: 'lines',
    fieldGroupClassName: 'd-grid regular-label label-400 hide-border-bottom',
    fieldGroup:
      sessionsItems.map(item => getSessionLine(item.key, item.label))
    ,
  })
];

export const volumeBreakdownConfig: IFieldConfig[] = [
  new FieldConfig({
    label: 'General',
    fieldGroupClassName: 'regular-label d-grid two-rows',
    fieldGroup: [
      getSelect({
        label: 'Delta type',
        className: 'select minimize-select',
        key: 'deltaType',
        options: [
          {
            label: 'BidAsk', value: 'bidAsk'
          },
          {
            label: 'Uptick/Downtick',
            value: 'uptickDowntick'
          },
        ],
      }),
      getSelect({
        key: 'type',
        className: 'select d-block minimize-select',
        options: [
          {
            label: 'Volume',
            value: 'volume'
          },
          {
            label: 'Ticks',
            value: 'ticks'
          },
          {
            label: 'Price',
            value: 'price'
          },
        ],
      }),
      getSelect({
        key: 'mode',
        label: 'Mode',
        className: 'select mt-1 d-block minimize-select',
        options: [
          {
            label: 'Delta (Buy - Sell Volume)',
            value: 'delta'
          },
          {
            label: 'Delta Bars',
            value: 'deltaBars'
          },
          {
            label: 'Delta Momentum',
            value: 'deltaMomentum'
          },
          {
            label: 'Buy Volume',
            value: 'buyVolume'
          },
          {
            label: 'Sell Volume',
            value: 'sellVolume'
          },
        ],
      }),
      {
        key: 'accumulate',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ key: 'enabled', label: 'Accumulate' }],
            additionalFields: [getSelect({
              key: 'value',
              options: [
                { label: 'Session', value: 'day' },
                { label: 'Week', value: 'week' },
                { label: 'Month', value: 'month' },
                { label: 'All Values', value: 'all' },
              ],
            })],
          }),
        ],
      },
      {
        key: 'avaragePeriod',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ key: 'enabled', label: 'Average Period' }],
            extraConfig: {
              fieldGroupClassName: 'd-grid average-period-rows'
            },
            additionalFields: [
              getNumber({
                key: 'value',
                min: 1,
              }),
            ],
          }),
        ],
      },
      new FieldConfig({
        fieldGroupClassName: 'd-grid two-rows',
        fieldGroup: [
          getColor({ key: 'upFillColor', label: 'Up' }),
          getColor({ key: 'upStrokeColor', label: 'Up Outline' }),
        ],
      }),
      {
        key: 'zeroLine',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{
              key: 'enabled',
              label: 'Zero Line',
            }],
            extraConfig: { fieldGroupClassName: 'd-grid zero-line-rows' },
            additionalFields: [
              wrapWithClass(getColor('strokeColor'), 'color-without-label'),
              getLineSelector({
                key: 'strokeTheme',
              }),
            ],
          }),
        ],
      },
      new FieldConfig({
        fieldGroupClassName: 'd-grid two-rows',
        fieldGroup: [
          getColor({ key: 'downFillColor', label: 'Down' }),
          getColor({ key: 'downStrokeColor', label: 'Down Outline' }),
        ],
      }),
    ]
  }),
  new FieldConfig({
    label: 'Size Filter',
    key: 'sizeFilter',
    className: 'mt-3 d-block',
    fieldGroup: [
      {
        key: 'sizeFilter',
        fieldGroupClassName: 'd-grid four-rows',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ key: 'enabled', label: 'Size Filter' }],
          }),
          wrapWithClass(getNumber({
            key: 'value',
            min: 0,
          }), 'd-flex justify-content-end'),
        ]
      },
    ],
  }),
];

export const vwapConfig: IFieldConfig[] = [
  new FieldConfig({
    label: 'General',
    key: 'general',
    fieldGroupClassName: 'regular-label  hide-border-bottom',
    className: 'vwap',
    fieldGroup: [
      new FieldConfig({
        label: 'Style',
        key: 'style',
        className: 'style',
        fieldGroupClassName: 'vwap-styles-grid',
        fieldGroup: [
          wrapWithClass(getSelect({
            options: [
              {
                label: 'Line, Connected', value: 'lineConnected'
              },
              {
                label: 'Line, Continuous', value: 'lineContinuous'
              },
              {
                label: 'Line, Stepped', value: 'lineStepped'
              },
              {
                label: 'Price Box, Solid', value: 'priceBoxSolid'
              },
              {
                label: 'Price Box, Hollow', value: 'priceBoxHollow'
              },
            ]
          }), 'max-width-85'),
          wrapWithClass(getColor('color'), 'color-without-label'),
          getLineSelector({
            key: 'line'
          }),
        ]
      }),
      getCheckboxes({
        checkboxes: [{
          key: 'customTimes',
          label: 'Custom Times'
        }],
        additionalFields: [
          getSessionsSelect('duration', { className: 'wvap-duration select session-template' }),
        ],
        extraConfig: {
          fieldGroupClassName: 'd-grid two-rows'
        },
      }),
      getCheckboxes({
        checkboxes: [{
          key: 'customDuration',
          label: 'Custom Duration'
        }],
        additionalFields: [
          getSelect({
            key: 'duration',
            options: [
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Quarterly', value: 'quarterly' },
              { label: 'Annualy', value: 'annualy' },
            ],
          }),
        ],
        extraConfig: {
          className: 'mt-2 d-block',
          fieldGroupClassName: 'd-grid two-rows'
        },
      }),
    ],

  }),
  new FieldConfig({
    label: 'Bands',
    key: 'bands',
    className: 'mt-3',
    fieldGroup: [
      getBand(1),
      getBand(2),
      getBand(3),
    ],
  }),
  new FieldConfig({
    label: 'Label',
    key: 'label',
    className: 'mt-3',
    fieldGroupClassName: 'd-grid two-rows regular-label hide-border-bottom',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [{ label: 'Show VWAP Label', key: 'showLabel' }],
      }),
      getNumber({
        label: 'Label Line Length',
        min: 1,
      }),
    ],
  }),
];

export const zigZagConfig: IFieldConfig[] = [
  new FieldConfig({
    key: 'parameters',
    label: 'Parameters',
    fieldGroupClassName: 'two-rows d-grid zig-zag',
    fieldGroup: [
      getCheckboxes({
        checkboxes: [{
          key: 'showZigZagLine',
          label: 'Show ZigZag Line'
        }]
      }),
      {
        fieldGroupClassName: 'two-rows d-grid',
        fieldGroup: [
          getColor({ key: 'downStrokeColor', label: 'Down' }),
          getColor({ key: 'upStrokeColor', label: 'Up' }),
        ],
      },
      getNumber({
        label: 'Min. Change (Ticks)',
        key: 'minChange'
      }),
      getNumber({
        label: 'Bar Width Text Thr..',
        key: 'barWidthTextThreshold'
      }),
      getNumber({
        label: 'Data Box Offset(Px)',
        key: 'dataBoxOffset'
      }),
      getColor('Text Color'),
      {
        key: 'dataBoxBackground',
        className: 'full-width',
        fieldGroupClassName: 'two-rows d-grid p-0',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ key: 'enabled', label: 'Data Box Background' }],
          }),
          getColor({ key: 'value', label: 'Background Color' }),
        ],
      },
      {
        key: 'dataBoxBorder',
        className: 'full-width',
        fieldGroupClassName: 'two-rows d-grid  p-0',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [{ key: 'enabled', label: 'Data Box Border' }],
          }),
          getColor({ key: 'value', label: 'Border Color' }),
        ],
      },
      getCheckboxes({
        checkboxes: [{ key: 'showRealtimeSwing', label: 'Show Realtime Swing' }],
      }),
      getNumber({
        label: 'Min. Ticks Rev.',
        key: 'minTicksRev'
      }),
    ],
  }),
  new FieldConfig({
    label: 'Data Box',
    key: 'dataBox',
    fieldGroupClassName: '',
    fieldGroup: [
      wrapWithClass(getDataBox('fields'), 'data-box-border'),
      getCheckboxes({
        extraConfig: {
          className: 'mt-2 d-block',
          fieldGroupClassName: '',
        },
        checkboxes: [{
          label: 'Inverse Sorting for Down Swing',
          key: 'inverseSortingForDownSwing'
        }],
      }),
    ],
  }),
];

export const zigZagOscillatorConfig: IFieldConfig[] = [
  new FieldConfig({
    label: 'Parameters',
    key: 'parameters',
    fieldGroupClassName: 'two-rows d-grid zig-zag',
    fieldGroup: [
      getNumber({ label: 'Min. Change (Ticks)', key: 'minChange' }),
      getNumber({ label: 'Bar Width Text Thr..', key: 'barWidthTextThreshold' }),
      getColor({ key: 'downFillColor', label: 'Down Bars' }),
      getColor({ key: 'upFillColor', label: 'Up Bars' }),
      getCheckboxes({
        checkboxes: [{
          key: 'fillBarGaps', label: 'Fill Bar Gaps'
        }]
      }),
      {
        key: 'showChange',
        fieldGroup: [
          getCheckboxes({
            checkboxes: [
              {
                key: 'enabled', label: 'Show Change in'
              },
            ],
            additionalFields: [
              getSelect({
                key: 'unit',
                options: [
                  { label: 'Points', value: 'points' },
                  { label: 'Ticks', value: 'ticks' },
                ],
              }),
            ],
            extraConfig: {
              fieldGroupClassName: 'd-grid two-rows'
            },
          })
        ]
      }
    ],
  }),
  new FieldConfig({
    label: 'Upper Band',
    key: 'upperBand',
    fieldGroupClassName: 'two-rows d-grid zig-zag',
    className: 'mt-3 d-block',
    fieldGroup: [
      wrapWithClass(getColor({ key: 'strokeColor', label: 'Color' }), 'full-width half-width'),
      getNumber({
        label: 'Bottom (Points)',
        key: 'bottom',
      }),
      getNumber({
        label: 'Top (Points)',
        key: 'top',
      }),
    ],
  }),
  new FieldConfig({
    label: 'Lower Band',
    key: 'lowerBand',
    className: 'mt-3 d-block',
    fieldGroupClassName: 'two-rows d-grid zig-zag',
    fieldGroup: [
      wrapWithClass(getColor({ key: 'strokeColor', label: 'Color' }), 'full-width half-width'),
      getNumber({
        label: 'Bottom (Points)',
        key: 'bottom',
      }),
      getNumber({
        label: 'Top (Points)',
        key: 'top',
      }),
    ],
  }),
];

/*export const zigZagOscilatorSettings = {
  lowerBand: {
    bottomPoints: 4,
    color: 'rgb(234,57,57,1)',
    topPoints: 3,
  },
  params: {
    barWidth: 3,
    downBars: 'rgb(255,238,180,1)',
    fillBarGaps: true,
    minChange: 2,
    showChangeIn: true,
    upBars: 'rgb(120,198,255,1)',
  },
  upperBand: {
    bottomPoints: 3,
    color: 'rgb(0,178,172,1)',
    topPoints: 4,
  }
};*/

// export const zigZagSettings = {
//   parameters: {
//     backgroundColor: 'rgb(105,0,239,1)',
//     barWidth: 1,
//     borderColor: 'rgb(255,223,111,1)',
//     dataBoxBackgroundEnabled: true,
//     dataBoxBorderEnabled: true,
//     down: 'rgb(0,242,126,1)',
//     minChange: 7,
//     minRevTicks: 3,
//     show: true,
//     showRealtimeSwing: true,
//     textColor: 'rgb(0,242,126,1)',
//     up: 'rgb(120,198,255,1)',
//   },
//   dataBox: {
//     dataBoxParams: {
//       dataBoxPlacement: ['delta', 'volume', 'price', 'priceChanged'],
//       delta: true,
//       price: true,
//       priceChanged: true,
//       showIn: 'showInPoints',
//       volume: true,
//       negativeDelta: 'rgb(0,255,133,1)',
//       positiveDelta: 'rgb(14,67,255,1)',
//     },
//     inverseSorting: true
//   },
// };
/*
*
export const priceStatsDefaultSettings = {
  general: {
    currentSession: true,
    currentSessionWidth: 3,
    currentSessionWidthType: 'px',
    days: true,
    daysCount: 1,
    includeCurrentSession: true,
    previousSession: true,
    previousSessionWidth: 3,
    previousSessionWidthType: 'percent',
    type: 'tradesCount',
    va: 2,
    value: 1,
    width: 1,
    widthType: 'percent',
  },
  profile: {
    overlayEthOverRth: false,
    ethOverlay: {
      color: { type: 'customBlend', value: '#a0a0a0' },
      developPOC: true,
      developVA: true,
      pocChartOverlay: true,
      pocColor: 'rgb(241,110,110,1)',
      tradingHours: 'cmeTrading',
      type: 'dots',
      vaChartOverlay: true,
      vaColor: 'rgb(0,122,64,1)',
    },
    general: {
      color: { type: 'heatMap', value: '#a0a0a0' },
      developPOC: true,
      developVA: true,
      pocChartOverlay: true,
      pocColor: 'rgb(0,242,126,1)',
      tradingHours: 'cmeTrading',
      type: 'dots',
      vaChartOverlay: true,
      vaColor: 'rgb(0,32,143,1)',
    },
    rth: {
      color: { type: 'customBlend', value: '#a0a0a0' },
      developPOC: true,
      developVA: true,
      pocChartOverlay: true,
      pocColor: 'rgb(0,220,114,1)',
      tradingHours: 'newSession',
      type: 'dots',
      vaChartOverlay: true,
      vaColor: 'rgb(0,242,126,1)',
    }
  }
};

export const compositeProfileSettings = {
    general: {
      align: 'left',
      smoothed: { enabled: true, value: 5 },
      type: 'tradesCount',
      va: 2,
      value: 4,
      width: 4,
      widthType: 'percent',
    },
    lines: {
      poc: {
        colors: {
          strokeColor: 'rgb(0,153,80,1)'
        },
        enabled: true,
        labelEnabled: true,
      },
      valueArea: {
        colors: {
          strokeColor: 'rgb(0,153,80,1)'
        },
        enabled: true,
        labelEnabled: true,
      }
    },
    profile: {
      overlayEthOverRth: false,
      ETH: {
        color: { type: 'heatMap', value: '#a0a0a0' },
        tradingHours: 'cmeTrading',
        type: 'dots',
      },
      RTH: {
        color: { type: 'heatMap', value: '#a0a0a0' },
        tradingHours: 'cmeTrading',
        type: 'dots',
      },
      general: {
        color: { type: 'customBlend', value: '#a0a0a0' },
        tradingHours: 'newSession',
        type: 'hollowBlocks',
      }
    }
  };
* */
