export type Column = {
  name: string;
  title?: string;
  visible: boolean;
  draw?: (context) => boolean;
  style?: any;
  width?: number;
};
