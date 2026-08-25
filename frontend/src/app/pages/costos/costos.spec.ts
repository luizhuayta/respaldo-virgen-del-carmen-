import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Costos } from './costos';

describe('Costos', () => {
  let component: Costos;
  let fixture: ComponentFixture<Costos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Costos],
    }).compileComponents();

    fixture = TestBed.createComponent(Costos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
