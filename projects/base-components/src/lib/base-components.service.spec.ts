import { TestBed } from '@angular/core/testing';

import { BaseComponentsService } from './base-components.service';

describe('BaseComponentsService', () => {
  let service: BaseComponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseComponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
