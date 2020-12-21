export interface ILinkNode<T = any> {
  link: number | string;
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
    console.time();

    if (this._freeze || !data || !data.link)
      return;

    this._freeze = true;

    for (const node of this._nodes) {
      if (node.link === data.link && node !== data.creator && node.handleLinkData)
        node.handleLinkData(data.data);
    }

    this._freeze = false;

    console.timeEnd();
  }
}
