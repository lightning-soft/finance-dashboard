export interface ILinkNode<T = any> {
  listener?: any;
  link: number | string;
  layoutContainer?: { visible: boolean };
  handleLinkData?(data: T);
}

export interface ILinkData<T = any> {
  link: string | number;
  creator: ILinkNode<T>;
  data: T;
}

export class LinkDataObserver {
  private _nodes: ILinkNode[] = [];

  private _freeze = false;

  subscribe(node: ILinkNode) {
    this._nodes.push(node);
  }

  unsubscribe(node: ILinkNode) {
    this._nodes = this._nodes.filter(n => n !== node);
  }

  emitLinkData(data: ILinkData) {
    if (this._freeze || !data || !data.link)
      return;

    this._freeze = true;
    for (const node of this._nodes) {
      const visible = node.layoutContainer?.visible ?? true;
      if (node.link === data.link && visible && (node.listener ?? node) !== data.creator && node.handleLinkData)
        node.handleLinkData(data.data);
    }

    this._freeze = false;
  }
}
