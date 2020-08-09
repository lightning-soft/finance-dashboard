import { Component, OnInit } from '@angular/core';
import { WatchlistItem } from './models/watchlist.item';

@Component({
  selector: 'watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit {
  headers = ['name', 'ask', 'bid', 'timestamp'];

  data: WatchlistItem[] = [];

  ngOnInit(): void {
    for (let id = 0; id < 100; id++) {
      this.data.push(new WatchlistItem({ name: id.toString(), id }))
    }

    setInterval(() => {
      const count = Math.floor(randomIntFromInterval(0, this.data.length))
      const step = Math.floor(randomIntFromInterval(0, this.data.length / 4)) + 1

      for (let i = step; i < count; i += step) {
        const item = this.data[i];
        const updates = {};

        for (const key of ['ask', 'bid']) {
          const value = +item[key].value;
          updates[key] = randomIntFromInterval(value - 0.1, value + 0.1);
        }

        item.processQuote({
          instrumentId: i,
          timestamp: new Date(),
          ...updates,
        } as any);
      }
    }, 100)
  }
}

function randomIntFromInterval(min, max) { // min and max included 
  return +(Math.random() * (max - min + 1) + min).toFixed(4);
}