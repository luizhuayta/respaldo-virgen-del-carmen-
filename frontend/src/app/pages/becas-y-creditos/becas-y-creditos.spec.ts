import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecasYCreditos } from './becas-y-creditos';

describe('BecasYCreditos', () => {
  let component: BecasYCreditos;
  let fixture: ComponentFixture<BecasYCreditos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BecasYCreditos],
    }).compileComponents();

    fixture = TestBed.createComponent(BecasYCreditos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
