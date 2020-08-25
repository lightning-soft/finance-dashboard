import { IInstrument } from "communication";
import { FakeRepository } from "../common";

export class FakeInstrumentsRepository extends FakeRepository<IInstrument> {

    protected async _getItems() {
        const symbolsFilePath = './assets/instruments.json';
        const response = await fetch(symbolsFilePath);
        const data = await response.json();
        return data.map(i => ({ tickSize: 0.01, id: i.symbol, name: i.symbol, ...i })).slice(0, 100);
    }
}
