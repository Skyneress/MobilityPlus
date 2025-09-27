import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroSalud } from './registro-salud';

describe('RegistroSalud', () => {
  let component: RegistroSalud;
  let fixture: ComponentFixture<RegistroSalud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroSalud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroSalud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
