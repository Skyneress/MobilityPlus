import { TestBed } from '@angular/core/testing';

import { UsuarioServiceTs } from './usuario.service.ts';

describe('UsuarioServiceTs', () => {
  let service: UsuarioServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
