export type Column = {
  name: string;
  title?: string;
  subtitle?: string;
  tableViewName?: string;
  visible: boolean;
  disabled?: boolean;
  // represents should column be hidden in table settings
  hidden?: boolean;
  canHide: boolean;
  draw?: (context) => boolean;
  style?: any;
  width?: number;
  type?: string;
};
