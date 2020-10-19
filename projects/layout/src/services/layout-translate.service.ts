import {InjectionToken, Injector} from '@angular/core';
import {translateServiceFactory, TranslateServices} from 'shared';

export const LayoutTranslateService = new InjectionToken<TranslateServices>('LayoutTranslateService');

export const layoutTranslateFactory = (injector: Injector) => {
  return translateServiceFactory(injector, 'layout');
};
