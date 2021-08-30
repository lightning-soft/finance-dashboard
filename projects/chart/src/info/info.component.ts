import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

@Component({
  selector: 'info-component',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
@UntilDestroy()
export class InfoComponent implements OnInit {
  @ViewChild('ask', { static: true })
  ask: ElementRef;

  @ViewChild('bid', { static: true })
  bid: ElementRef;

  askInfo: any = {};
  bidInfo: any = {};

  private _updateSetted = false;

  constructor(private _cd: ChangeDetectorRef) {

  }

  ngOnInit() {
    this._cd.detach();
  }

  handleBestAsk(info: any) {
    this.askInfo = info;
    this._update();
  }

  handleBestBid(info: any) {
    this.bidInfo = info;
    this._update();
  }

  private _update() {
    if (this._updateSetted)
      return;

    this._updateSetted = true;

    requestAnimationFrame(() => {
      if (this.bidInfo !== true) {
        this.bid.nativeElement.textContent = toString(this.bidInfo);
        this.bidInfo = true;
      }
      if (this.askInfo !== true) {
        this.ask.nativeElement.textContent = toString(this.askInfo);
        this.askInfo = true;
      }
      this._updateSetted = false;
    });
  }
}

const placeholder = '--';

function toString(info) {
  return `${info.price ?? placeholder} ${info.volume ?? placeholder}`;
}
