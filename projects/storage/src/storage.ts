export abstract class Storage {
  abstract getItem(key: string): any;
  abstract setItem(key: string, data: any);
  abstract clear();
  abstract deleteItem(key: string);
}
