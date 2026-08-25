import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Licenciamiento } from './licenciamiento';

describe('Licenciamiento', () => {
  let component: Licenciamiento;
  let fixture: ComponentFixture<Licenciamiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Licenciamiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Licenciamiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
