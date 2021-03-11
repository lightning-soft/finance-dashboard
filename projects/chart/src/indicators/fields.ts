import {
  FieldConfig,
  getCheckboxes,
  getColor, getColorSelect,
  getInput, getLineSelector,
  getNumber,
  getSelect, getSwitch, getTextAlign,
  IFieldConfig,
  wrapWithClass, wrapWithConfig
} from 'dynamic-form';


function getTradingSelect() {
  return getSelect({
    key: 'tradingHours',
    className: 'select full-width',
    label: 'Session Template',
    // wrappers: [],
    options: [
      {
        label: 'New Session',
        value: 'newSession'
      },
      {
        label: 'CME Trading Hours',
        value: 'cmeTrading'
      },
      {
        label: 'Template 2',
        value: 'template2'
      }

    ],
  });
}

function getProfileConfig(key, _config = {}) {
  const config = {
    additionalElements: [],
  };
  Object.assign(config, _config);
  const { additionalElements, ...extraConfig } = config;
  return {
    key,
    fieldGroupClassName: 'd-grid two-rows',
    className: 'profile-settings',
    fieldGroup: [
      ...additionalElements,
      getSelect({
        key: 'type',
        label: 'Profile Type',
        className: 'regular-label label-400 hide-border-bottom',
        options: [
          { icon: 'icon-hollow-block', value: 'hollowBlocks', label: 'Hollow Blocks' },
          { icon: 'icon-dots-indicator', value: 'dots', label: 'Dots' },
          { icon: 'icon-lines-indicator', value: 'lines', label: 'Lines' },
          { icon: 'icon-hollowgram', value: 'hollowgram', label: 'Hollowgram' },
          { icon: 'icon-solidgram', value: 'solidgram', label: 'Solidgram' },
          { icon: 'icon-filled-line', value: 'filledLine', label: 'Filled Line' },
          { icon: 'icon-hollow-line', value: 'hollowline', label: 'Hollow Line' },
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
        extraConfig: { className: 'extend-naked-poc' }
      }),
      {
        key: 'extendNaked',
        className: 'full-width',
        fieldGroupClassName: 'd-grid two-rows',
        fieldGroup: [
          getCheckboxes({
            extraConfig: {
              className: ''
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

function getValueArea(key, _config = {}) {
  const defaultConfig = { extraGroupClass: '', };
  Object.assign(defaultConfig, _config);
  const { extraGroupClass, ...config } = defaultConfig;

  return {
    key,
    fieldGroupClassName: `d-grid three-rows align-items-center ${extraGroupClass}`,
    wrappers: ['form-field'],
    templateOptions: {
      label: config['label']
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
          className: 'hideLabel'
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

export const footprintConfig: IFieldConfig[] = [
  new FieldConfig({
    key: 'main',
    label: 'Main Properties',
    fieldGroupClassName: 'd-grid two-rows',
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
            value: 'price',
            label: 'Price'
          }
        ],
        className: 'select full-width'
      }),
    ],
  }),
  new FieldConfig({
    key: 'font',
    label: 'Font',
    fieldGroupClassName: 'd-grid two-rows',
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
    fieldGroupClassName: 'd-grid two-rows hide-border-bottom',
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
    fieldGroupClassName: 'inline-fields regular-label hide-border-bottom',
    className: '',
    fieldGroup: [
      getSelect({
        label: 'Text Style',
        key: 'textStyle',
        className: 'select',
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
        className: 'split-input d-block mt-1'
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
      getNumber({ label: 'Default bar width', min: 1, key: 'defaultBarWidth', className: 'split-input d-block mt-2' }),
      getNumber({
        label: 'Bar width text threshold',
        min: 1,
        key: 'barWidthTextThreshold',
        className: 'split-input mt-2 d-block'
      }),
    ]
  }),
  new FieldConfig({
    key: 'profile',
    label: 'Profile',
    fieldGroupClassName: 'inline-fields hide-border-bottom',
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
    className: 'mt-2 d-block',
    label: 'Volume Filter',
    fieldGroupClassName: 'inline-fields regular-label hide-border-bottom',
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
    fieldGroupClassName: 'inline-fields regular-label hide-border-bottom',
    fieldGroup: [
      getSwitch('enabled', 'Enabled'),
      getInput({
        key: 'threshold',
        label: 'Threshold, %',
        className: 'split-input'
      }),
      new FieldConfig({
        fieldGroupClassName: 'd-grid two-rows mt-1',
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
    className: 'pb-1 d-block',
    fieldGroupClassName: 'inline-fields regular-label',
    fieldGroup: [
      getSwitch('enabled', 'Enable Pullback'),
      new FieldConfig({
        fieldGroupClassName: 'd-grid two-rows mt-2',
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
    fieldGroupClassName: 'd-grid two-rows inline-fields  hide-border-bottom regular-label',
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
          }),
          getNumber({
            key: 'value',
            min: 0,
          }),
          getSelect({
            key: 'unit',
            options: [
              {
                value: 'bars',
                label: 'Bars'
              },
              {
                value: 'minutes',
                label: 'Minutes'
              },
              {
                value: 'days',
                label: 'Days'
              },
              {
                value: 'weeks',
                label: 'Weeks'
              },
              {
                value: 'month',
                label: 'Month'
              },
              {
                value: 'quarters',
                label: 'Quarters'
              },
              {
                value: 'years',
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
            value: 'ticks',
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
      getNumber({ label: 'Value Area, %', key: 'va', min: 0,  max: 100  }),
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
      getNumber({ label: 'Ticks per Level', key: 'ticksPerLevel', min: 1, }),
      getNumber({
        key: 'calculateXProfiles',
        label: 'Calculate X profiles',
        min: 1,
        className: 'calculate-profiles'
      }),
      getTextAlign('align', 'Profile Alignment',
        { className: 'profile-alignment' }),
    ],
  }),
  new FieldConfig({
    key: 'profile',
    label: 'Profile Settings',
    className: 'mt-4 d-block',
    fieldGroupClassName: '',
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
          getTradingSelect(),
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
          getTradingSelect(),
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
    fieldGroupClassName: '',
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
    fieldGroupClassName: 'd-grid two-rows',
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
          fieldGroupClassName: 'd-grid two-rows'
        },
      }),
      new FieldConfig({
        key: 'summaryFont',
        label: 'Summary Font',
        fieldGroupClassName: 'd-grid two-rows',
        className: 'hide-border-bottom regular-label full-width label-400',
        fieldGroup: [
          {
            fieldGroupClassName: 'd-grid two-rows',
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

export const volumeBreakdownConfig: IFieldConfig[] = [
  new FieldConfig({
    label: 'Delta',
    fieldGroupClassName: 'regular-label',
    fieldGroup: [
      getSelect({
        label: 'Type',
        className: 'select minimize-select',
        key: 'type',
        options: [
          {
            label: 'BidAsk', value: 'BidAsk'
          },
          {
            label: 'UpDownTickWithContinuation',
            value: 'UpDownTickWithContinuation'
          },
          {
            label: 'UpDownOneTickWithContinuation',
            value: 'UpDownOneTickWithContinuation'
          },
          {
            label: 'Hybrid',
            value: 'hybrid'
          }
        ],
      }),
      getSelect({
        label: 'Reset mode',
        key: 'resetMode',
        className: 'select mt-1 d-block',
        options: [
          {
            label: 'Session',
            value: 'session'
          },
          {
            label: 'Bar',
            value: 'bar'
          },
          {
            label: 'DeltaMomentum',
            value: 'DeltaMomentum'
          },
          {
            label: 'Cumulative',
            value: 'Cumulative'
          }
        ],
      }),
      getNumber({
        label: 'Show X Bars',
        key: 'showBars',
        min: 1,
        className: 'split-input  mt-1 d-block',
      }),
      getCheckboxes({
        extraConfig: { fieldGroupClassName: 'd-grid two-rows', className: 'mt-1 d-block' },
        checkboxes: [{
          key: 'invertDelta',
          label: 'Invert Delta',
        }, {
          key: 'averageDelta',
          label: 'Average Delta',
        }]
      }),
      getNumber({
        label: 'Average Period',
        key: 'averagePeriod',
        min: 1,
        className: 'split-input mt-1 d-block',
      }),
      getCheckboxes({
        checkboxes: [
          {
            key: 'showCandles',
            label: 'Show Candles',
            extraConfig: {
              className: 'mt-1 d-block'
            }
          }
        ],
      }),
    ]
  }),
  new FieldConfig({
    label: 'Filter',
    className: 'block mt-2',
    fieldGroupClassName: 'regular-label',
    fieldGroup: [
      getSelect({
        label: 'Type',
        className: 'select mt-1 d-block',
        key: 'type',
        options: [
          {
            label: 'None',
            value: 'none',
          },
          {
            label: 'GreaterOrEqualTo',
            value: 'GreaterOrEqualTo',
          },
          {
            label: 'LessThanOrEqualTo',
            value: 'LessThanOrEqualTo',
          },
        ],
      }),
      getNumber({ label: 'Size', min: 1, key: 'size', className: 'split-input mt-1 d-block' }),

    ],
  }),
  new FieldConfig({
    label: 'Colors',
    className: 'block mt-2',
    fieldGroupClassName: 'd-grid two-rows',
    fieldGroup: [
      getColor('Up Color'),
      getColor('Down Color'),
      getColor('Up color outline'),
      getColor('Down color outline'),
    ],
  }),
  new FieldConfig({
    label: 'Optimization',
    className: 'block mt-2',
    fieldGroupClassName: 'regular-label',
    fieldGroup: [
      getNumber({
        label: 'Work during Last X Bars',
        key: 'workLastBars',
        min: 1,
        className: 'split-input',
      })
    ],
  }),
  new FieldConfig({
    label: 'Setup',
    className: 'block mt-2',
    fieldGroupClassName: 'regular-label hide-border-bottom',
    fieldGroup: [
      getSelect({
        className: 'select',
        key: 'calculate',
        label: 'Calculate', options: [{
          label: 'On bar close',
          value: 'onBarClose'
        },
          {
            label: 'On each tick',
            value: 'onEachTick'
          },
          {
            label: 'On price change',
            value: 'onPriceChange'
          }
        ]
      }),
      getInput({
        label: 'Label', className: 'split-input inline-fields mt-1 d-block',
      }),
      getSelect({
        label: 'Max bars look back', options: [
          { value: '256', label: '256' },
          { value: 'Infinite', label: 'Infinite' }
        ],
        className: 'select mt-1 d-block'
      }),
    ],
  }),
];
