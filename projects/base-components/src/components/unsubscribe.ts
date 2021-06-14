import { MixinHelper } from "../helpers";

const { mixinDecorator } = MixinHelper;


export interface IUnsubscribe {
  unsubscribe(fn?: () => void);
}

class UnsubscribeClass {
  __unsubscribe: () => void;

  unsubscribe(fn?: () => void) {
    if (this.__unsubscribe)
      this.__unsubscribe();

    this.__unsubscribe = fn;
  }
}

export function BindUnsubscribe() {
  return mixinDecorator(UnsubscribeClass);
}
