import { FakeRepository } from 'communication';
import { ITimezone } from 'trading';

const items: ITimezone[] = [
  {
    id: 1,
    name: 'America/Chicago',
  },
  {
    id: 2,
    name: 'Europe/Kiev',
  },
];

export class FakeTimezonesRepository extends FakeRepository<ITimezone> {
  protected async _getItems() {
    return items;
  }
}
