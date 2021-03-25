export type Column = {
  name: string;
  title?: string;
  visible: boolean;
  // represents should column be hidden in table settings
  hidden?: boolean;
  draw?: (context) => boolean;
  style?: any;
  width?: number;
};
