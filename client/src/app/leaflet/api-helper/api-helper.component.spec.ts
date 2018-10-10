import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiHelperComponent } from './api-helper.component';

describe('ApiHelperComponent', () => {
  let component: ApiHelperComponent;
  let fixture: ComponentFixture<ApiHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
