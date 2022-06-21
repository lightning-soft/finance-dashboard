import { FieldConfig, getCheckboxes, getColor, getSwitch, IFieldConfig, wrapWithClass } from 'dynamic-form';

export const orderFields: IFieldConfig = new FieldConfig({
  fieldGroupClassName: 'd-flex flex-wrap two-rows p-x-7',
  label: 'Order Area',
  key: 'settings',
  fieldGroup: [
    getColor('Buy Buttons Background Color'),
    getColor('Flat Buttons Background Color'),
    getColor('Buy Buttons Font Color'),
    getColor('Flat Buttons Font Color'),
    getColor('Sell Buttons Background Color'),
    getColor('Cancel Button Background Color'),
    getColor('Sell Buttons Font Color'),
    getColor('Cancel Button Font Color'),
    {
      key: 'formSettings',
      className: 'w-100 ml-0 mr-0 order-form-settings',
      fieldGroup: [
        getCheckboxes({
          checkboxes: [
            { key: 'showInstrumentChange', label: 'Show Instrument Change' },
            // { key: 'closePositionButton', label: 'Show Close Position Button' },
            { key: 'closePositionButton', label: 'Show Liquidate Button' },
            { key: 'showOHLVInfo', label: 'Show OHLV Info' },
            { key: 'showFlattenButton', label: 'Show Flatten Button' },
            { key: 'showBracket', label: 'Show Bracket Button' },
            {
              key: 'showIcebergButton',
              label: 'Show Iceberg Button',
              // config: { className: 'w-100 iceberg-checkbox' }
            },
            { key: 'showOrderConfirm', label: 'Require Order Confirmation' },
            { key: 'showCancelConfirm', label: 'Require Cancel Confirmation' }
          ]
        }),
        wrapWithClass(getCheckboxes({
          checkboxes: [
            { key: 'showPLInfo', label: 'Show PL Info' },
            { key: 'roundPL', label: 'Round PL to whole numbers' },
          ]
        }), 'm-0 settings-pl-info'),
        wrapWithClass(getSwitch('includeRealizedPL', 'Include Realized PL',
          { hideExpression: '!model.showPLInfo' }
        ), 'settings-pl-realized-info'),
      ],
    }
  ],
});
