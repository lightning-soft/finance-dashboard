import {
  FieldConfig,
  getColor, getSelect, getSwitch,
  IFieldConfig,
} from "dynamic-form";

function disableExpression(field, expression: string) {
  return {
    ...field, expressionProperties: {
      'templateOptions.disabled': expression,
    }
  };
}

export const generalFields: IFieldConfig[] = [
  new FieldConfig({
    key: 'general',
    fieldGroupClassName: '',
    fieldGroup: [
      new FieldConfig({
          fieldGroupClassName: 'd-grid two-rows p-x-10 m-t-20',
          fieldGroup: [
            getColor({ label: 'Up Candle Color', key: 'upCandleColor' }),
            getColor({ label: 'Down Candle Color', key: 'downCandleColor' }),
            new FieldConfig({
              fieldGroup: [
                disableExpression(
                  getColor({ label: 'Up Candle Border Color', key: 'upCandleBorderColor' }),
                  '!model.upCandleBorderColorEnabled'
                ),
                getSwitch('upCandleBorderColorEnabled', ''),
              ]
            }),
            new FieldConfig({
              fieldGroup: [
                disableExpression(
                  getColor({ label: 'Down Candle Border Color', key: 'downCandleBorderColor' }),
                  '!model.downCandleBorderColorEnabled'
                ),
                getSwitch('downCandleBorderColorEnabled', ''),
              ]
            }),
            getColor({ label: 'Line / Bar Color', key: 'lineColor' }),
            getColor({ label: 'Wick Color', key: 'wickColor' }),
          ]
        },
      ),
      new FieldConfig({
          label: ' ',
          fieldGroupClassName: 'd-grid two-rows p-x-10 p-b-15',
          fieldGroup: [
            getColor({ label: 'Gradient Color 1', key: 'gradient1' }),
            getColor({ label: 'Gradient Color 2', key: 'gradient2' }),
            getColor({ label: 'Value Scale Color', key: 'valueScaleColor' }),
            getColor({ label: 'Date Scale Color', key: 'dateScaleColor' }),
            getColor({ label: 'Grid Color', key: 'gridColor' }),
          ]
        },
      ),
      new FieldConfig({
          label: 'Font',
          key: 'font',
          fieldGroupClassName: 'd-flex p-x-10',
          fieldGroup: [
            getSelect({
              key: 'fontFamily',
              className: 'flex-grow-1 m-r-5',
              options: [
                { label: 'Arial', value: 'Arial' },
                { label: 'Comic Sans', value: 'Comic Sans' },
                { label: 'Courier New', value: 'Courier New' },
                { label: 'Georgia', value: 'Georgia' },
                { label: 'Impact', value: 'Impact' },
                { label: 'Open Sans', value: 'Open Sans' },
                { label: 'Source Sans Pro', value: 'Source Sans Pro' },
                { label: 'Tangerine', value: 'Tangerine' },
                { label: 'Calibri', value: 'Calibri' },
              ]
            }),
            getSelect({
              key: 'fontSize',
              className: 'd-block',
              options: [
                { label: '8', value: 8 },
                { label: '9', value: 9 },
                { label: '10', value: 10 },
                { label: '11', value: 11 },
                { label: '12', value: 12 },
                { label: '13', value: 13 },
                { label: '14', value: 14 },
                { label: '15', value: 15 },
                { label: '16', value: 16 },
                { label: '17', value: 17 },
                { label: '18', value: 18 },
                { label: '19', value: 19 },
                { label: '20', value: 20 },
              ]
            }),
            {
              ...getColor({ label: 'Text Color', key: 'textColor' }),
                className: 'flex-grow-1 m-l-5'
            },
          ]
        },
      ),
    ],
  }),
];

