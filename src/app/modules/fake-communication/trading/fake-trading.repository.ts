import { NumberHelper } from 'base-components';
import { FakeRepository, IBaseItem } from 'communication';

const { randomFixedNumber } = NumberHelper;

export abstract class FakeTradingRepository<T extends IBaseItem> extends FakeRepository<T> {
  protected _itemsTimeouts: { [key: number]: any } = {};

  protected _processItem(
    item: T,
    callbacks: ((item: T) => void)[],
    timeout: number = null,
  ) {
    const callbackIndex = Math.floor(Math.random() * (callbacks.length));
    const callback = callbacks[callbackIndex];
    const _timeout = timeout !== null ? timeout : randomFixedNumber(10000, 0);

    const timeoutId = setTimeout(() => {
      callback.bind(this)(item);

      delete this._itemsTimeouts[item.id];
    }, _timeout);

    this._itemsTimeouts[item.id] = timeoutId;
  }

  protected _declineItems(
    items: T[],
    isValid: (item: T) => boolean = () => true,
  ) {
    items.forEach(item => {
      const timeoutId = this._itemsTimeouts[item.id];

      if (timeoutId && isValid(item)) {
        clearTimeout(timeoutId);

        delete this._itemsTimeouts[item.id];
      }
    });
  }
}
