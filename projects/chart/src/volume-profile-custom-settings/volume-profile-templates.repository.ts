import { FakeRepository } from 'communication';

interface IVolumeTemplate {
  id: number;
  name: string;
  state: any;
}

class VolumeProfileTemplatesRepository extends FakeRepository<IVolumeTemplate> {
  async _getItems() {
    return [];
  }
}
