import { TestBed } from '@angular/core/testing';

import { SearchSelectService } from './search-select.service';

describe('SearchSelectService', () => {
  let service: SearchSelectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchSelectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
