const DEFAULT_NAME = 'Workspace';
const CONFIG_ID_PREFIX = 'w_#';

export class Workspace {
  id: number | string;
  configId: number | string;

  name: string;

  isActive = false;
  config: any;

  constructor(name: string) {
    this.id = Date.now();

    this.configId = CONFIG_ID_PREFIX + this.id;

    this.name = name || DEFAULT_NAME;
  }
}
