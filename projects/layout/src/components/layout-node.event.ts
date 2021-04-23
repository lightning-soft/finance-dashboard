export enum LayoutNodeEvent {
  Resize = 'resize',
  Show = 'show',
  Hide = 'hide',
  Event = 'event',
  Open = 'open',
  Destroy = 'destroy',
  Close = 'close',
  Tab = 'tab',
  MoveStart = 'move-start',
  Move = 'move',
  MoveEnd = 'move-end',
  ExtendState = 'extendState',
  MakeVisible = 'makeVisible',
  MakeInvisible = 'makeInvisible',
  Maximize = 'maximize',
  Restore = 'restore', // undo maximize
}
