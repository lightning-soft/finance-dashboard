import { FakeRepository } from 'communication';
import { ITimezone } from 'trading';

const items: ITimezone[] = [
  {
    id: 1,
    name: 'America/Chicago',
    offset: -6,
  },
  {
    id: 2,
    name: 'Europe/Kiev',
    offset: 2,
  },
];

export class FakeTimezonesRepository extends FakeRepository<ITimezone> {
  protected async _getItems() {
    return items;
  }
}
