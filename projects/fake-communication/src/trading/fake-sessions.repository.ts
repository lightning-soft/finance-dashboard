import { FakeRepository } from 'communication';
import { ISession } from 'trading';

const items: ISession[] = [
  {
    id: 1,
    name: 'Session 1',
    exchange: 'CME',
    timezoneId: 1,
    workingTimes: [],
  },
  {
    id: 2,
    name: 'Session 2',
    exchange: 'CME',
    timezoneId: 1,
    workingTimes: [],
  },
];

export class FakeSessionsRepository extends FakeRepository<ISession> {
  protected async _getItems() {
    return items;
  }
}
