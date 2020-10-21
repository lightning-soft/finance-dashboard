export abstract class LayoutHandler {
  abstract create(name: string);
  abstract save(config: any);
  abstract loadConfig(): any;
}
