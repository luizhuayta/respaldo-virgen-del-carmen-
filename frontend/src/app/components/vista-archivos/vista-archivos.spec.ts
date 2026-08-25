import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaArchivos } from './vista-archivos';

describe('VistaArchivos', () => {
  let component: VistaArchivos;
  let fixture: ComponentFixture<VistaArchivos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaArchivos],
    }).compileComponents();

    fixture = TestBed.createComponent(VistaArchivos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
