export interface Validator {
  name: string;
  validator: any;
  message: string;
}
/*
export interface FieldConfig {
  label?: string;
  name?: string;
  inputType?: string;
  options?: string[];
  collections?: any;
  type: string;
  value?: any;
  validations?: Validator[];
}*/

export enum FieldType {
  Input = 'input',
  Number = 'number',
  Select = 'select',
  Checkbox = 'checkbox',
  Color = 'color',
  Radio = 'radio',
  TextAlign = 'textAlign',
  Switch = 'switch',
  Hotkey = 'hotkey',
  ColorSelect = 'colorSelect',
  LineSelector = 'lineSelector',
  DatePicker = 'datePicker',
  ColumnSelector = 'columnSelector',
  Label = 'Label',
  DataBox = 'dataBox',
  SessionsSelect = 'sessions-select',
  DragAndDrop = 'drag-drop',
}

export enum InputType {
  Text = 'text',
  Password = 'password',
  Number = 'number',
}
