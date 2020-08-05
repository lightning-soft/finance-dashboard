import { Component, OnInit } from '@angular/core';
import {GoldenLayoutHandler} from '../layout/goldenLayout.handler';
import {ThemeService} from '../theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  links = this.goldenLayoutHandler.layoutItems;

  constructor(private goldenLayoutHandler: GoldenLayoutHandler,
              private themeService: ThemeService) { }
  ngOnInit(): void {
  }

  addLink(item: string) {
    this.goldenLayoutHandler.create(item);
  }

  switchTheme(name: string) {
    this.themeService.switchTheme(name);
  }
}
