import { IBar } from 'chart';
import { BarAction, ChartBarHandler } from './ChartBarHandler';

export class RenkoBarHandler extends ChartBarHandler {

  processBars(bars: IBar[]) {
    if (!bars?.length)
      return [];

    const resultBars = [];
    let lastBar: IBar;
    const offset = (this.chart.timeFrame.interval * this.chart.instrument.tickSize);
    // console.time('bars');

    let arrayStarter = 0;
    if (!lastBar) {
      lastBar = bars[0];
      arrayStarter++;
    }
    resultBars.push(lastBar);
    for (let i = arrayStarter; i < bars.length; i++) {
      lastBar = resultBars[resultBars.length - 1] ?? bars[i];
      const bar = bars[i];
      if (bar.close >= (lastBar.high + offset)) {
        let isFirstNewBar = true;
        let newBarOpen = lastBar.high;
        let newClose = lastBar.high + offset;

        lastBar.date = bar.date;
        lastBar.volume = 0;

        do {
          let i = 1;
          resultBars.push({
            open: newBarOpen,
            high: newClose,
            low: newBarOpen,
            close: newClose,
            date: new Date(lastBar.date.getTime() + i),
            volume: isFirstNewBar ? bar.volume : 0,
            details: isFirstNewBar ? bar.details : [],
          });
          i++;
          newBarOpen = newClose;
          newClose += offset;
          isFirstNewBar = false;
        }
        while (lastBar.close >= newClose);
      } else if ((lastBar.low - offset) >= bar.close) {
        let isFirstNewBar = true;
        let newBarOpen = lastBar.low;
        let newClose = lastBar.low - offset;

        lastBar.date = bar.date;
        //lastBar.volume = 0;

        do {
          let i = 1;
          newClose = newBarOpen - offset;
          resultBars.push({
            open: newBarOpen,
            high: newBarOpen,
            low: newClose,
            close: newClose,
            date: new Date(lastBar.date.getTime() + i),
            volume: isFirstNewBar ? bar.volume : 0,
            details: isFirstNewBar ? bar.details : [],
          });
          i++;
          newBarOpen = newClose;
          newClose -= offset;
          isFirstNewBar = false;
        }
        while (newClose >= bar.close);
      } else {
        lastBar.volume += bar.volume;
        lastBar.date = bar.date;
      }
    }
    ///  console.timeEnd('bars');
    return resultBars;
  }


  processBar(bar: IBar): { action: BarAction; bar: IBar } {
    // TODO Investigate how should it work in realtime
    return { action: BarAction.Add, bar };
  }

  clear() {
    super.clear();
  }
}

