export interface Validator {
  name: string;
  validator: any;
  message: string;
}

export interface FieldConfig {
  label?: string;
  name?: string;
  inputType?: string;
  options?: string[];
  collections?: any;
  type: string;
  value?: any;
  validations?: Validator[];
}

export enum FieldType {
  Input = 'input',
  Select = 'select',
  Checkbox = 'checkbox',
  Color = 'color',
  Radio = 'radio',
}

export enum InputType {
  Text = 'text',
  Password = 'password',
  Number = 'number',
}
