import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  theme$ =  new BehaviorSubject<string>('default');

  switchTheme(theme: string) {
    $('body').removeClass();
    $('body').addClass(theme);
  }
}
