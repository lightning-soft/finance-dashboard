import { Component } from '@angular/core';

@Component({
  selector: 'dom-form',
  templateUrl: './dom-form.component.html',
  styleUrls: ['./dom-form.component.scss']
})
export class DomFormComponent {
  showAmount = false;
  amountButtons = [
    {label: 1}, {label: 2, black: true},
    {label: 10}, {label: 50},
    {label: 100}, {label: 5}
  ];
  typeButtons = [
    {label: 'LMT'}, {label: 'STP MKT', black: true},
    {label: 'OCO', black: true},
    {label: 'STP LMT', black: true},
    {label: 'ICE', black: true},
    {label: 10},
  ];
  tifButtons = [
    {label: 'DAY'}, {label: 'GTC', black: true},
    {label: 'FOK', black: true},
    {label: 'IOC', black: true},
  ];
}
