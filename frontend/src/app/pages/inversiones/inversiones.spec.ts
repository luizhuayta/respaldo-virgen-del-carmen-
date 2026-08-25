import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inversiones } from './inversiones';

describe('Inversiones', () => {
  let component: Inversiones;
  let fixture: ComponentFixture<Inversiones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inversiones],
    }).compileComponents();

    fixture = TestBed.createComponent(Inversiones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
