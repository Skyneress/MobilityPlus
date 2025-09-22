import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteInicio } from './paciente-inicio';

describe('PacienteInicio', () => {
  let component: PacienteInicio;
  let fixture: ComponentFixture<PacienteInicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteInicio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteInicio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
