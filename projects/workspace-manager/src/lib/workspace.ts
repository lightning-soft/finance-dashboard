import { ExcludeId } from 'communication';

const DEFAULT_WORKSPACE_NAME = 'Workspace';
const DEFAULT_WINDOW_NAME = 'Window';
export const blankBase = 'blank';

export class Workspace {
  id: number | string;
  name: string;
  isActive = false;
  isDefault: boolean;
  windows: WorkspaceWindow[] = [];

  constructor(name: string, isDefault: boolean = false) {
    this.id = Date.now();
    this.name = name || DEFAULT_WORKSPACE_NAME;
    this.isDefault = isDefault;
  }
}

export class WorkspaceWindow {
  id: number | string;
  config: any;
  name: string;
  isSelected: boolean;
  isOnStartUp: boolean;

  constructor(windowConfig: ExcludeId<WorkspaceWindow> = {}) {
    this.id = Date.now();
    this.config = generateConfig(windowConfig.config);
    this.name = windowConfig.name || DEFAULT_WINDOW_NAME;
  }
}

function generateConfig(config) {
  if (!config)
    return [];

  return config.map(item => ({ ...item, id: `${Date.now()}_${Math.random()}` }));
}
