import { IInstrument, IOrder } from 'trading';
import { Column } from 'data-grid';
import { IBaseItem, Id } from 'communication';
import * as cloneDeep from 'lodash.clonedeep';

export class InstrumentHolder implements IBaseItem {
  id: Id;
  expanded = true;
  draftOrders: IOrder[] = [];

  constructor(public instrument: IInstrument) {
    this.id = instrument.id;
  }
}

export class LabelHolder implements IBaseItem {
  id: Id;

  constructor(public label: string) {
    this.id = 'label_' + Date.now();
  }
}

export type TabItem = InstrumentHolder | LabelHolder;

export class Tab {
  id: Id;
  name: string;
  data: TabItem[] = [];

  columns: Column[] = [];

  constructor(config: Partial<Tab>) {
    this.id = config.id ?? Date.now();
    this.name = config.name;
    this.data = config.data ?? [];
    this.columns = config.columns;
  }

  getInstruments() {
    return this.getInstrumentHolders().map((item: InstrumentHolder) => item.instrument as IInstrument);
  }

  getInstrumentHolders(): InstrumentHolder[] {
    return this.data.filter((item: InstrumentHolder) => {
      return item.instrument;
    }) as InstrumentHolder[];
  }

  changeInstrument(oldInstrument: IInstrument, newInstrument: IInstrument) {
    const index = this.data.findIndex((item: InstrumentHolder) => item?.instrument?.id === oldInstrument.id);
    const instrumentHolder =  (this.data[index] as InstrumentHolder);
    instrumentHolder.instrument = newInstrument;
    instrumentHolder.id = newInstrument.id;
  }

  getLabelHolder(id: Id): LabelHolder {
    return this.data.find(item => item.id === id) as LabelHolder;
  }

  getInstrumentHolder(instrument: IInstrument): InstrumentHolder {
    return this.data.find(item => item.id === instrument.id) as InstrumentHolder;
  }

  hasInstrument(instrument: IInstrument) {
    return this.data.some(item => item?.id === instrument.id);
  }

  addInstruments(instruments: IInstrument[], index = this.data.length) {
    this.data.splice(index, 0, ...instruments.map(instrument => new InstrumentHolder(instrument)));
  }

  deleteInstrument(instrument: IInstrument) {
    this.data = this.data
      .filter((item: InstrumentHolder) => !item.instrument || item.instrument?.id !== instrument?.id);
  }

  clone(config: Partial<Tab> = {}) {
    const columns = cloneDeep(this.columns);
    const tab = new Tab({ name: this.name, data: cloneDeep(this.data), columns });
    Object.assign(tab, config);
    return tab;
  }

  removeHolder(id: Id) {
    this.data = this.data.filter(item => item.id !== id);
  }
}
