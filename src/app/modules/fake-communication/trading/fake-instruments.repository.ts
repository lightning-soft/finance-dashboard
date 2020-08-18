import { Repository, IInstrument, ExcludeId } from "communication";
import { Observable, from } from "rxjs";

export class FakeInstrumentsRepository extends Repository<IInstrument>{
    getItemById(id): Observable<IInstrument> {
        return Observable.throw(new Error('Method getItemById not implemented'));
    }
    createItem(item: ExcludeId<IInstrument>, options?: any, projectId?: number): Observable<IInstrument> {
        return Observable.throw(new Error('Method createItem not implemented'));
    }
    updateItem(item: IInstrument): Observable<IInstrument> {
        return Observable.throw(new Error('Method updateItem not implemented'));
    }
    deleteItem(id: number | string): Observable<boolean> {
        return Observable.throw(new Error('Method deleteItem not implemented'));
    }
    getItems(params?): Observable<IInstrument[]> {
        return from(this._getInstruments());
    }

    private async _getInstruments() {
        const symbolsFilePath = './assets/instruments.json';
        const response = await fetch(symbolsFilePath);
        const data = await response.json();
        return data.map(i => ({ tickSize: 0.01, id: i.symbol, name: i.symbol, ...i })).slice(0, 100);
    }
}
