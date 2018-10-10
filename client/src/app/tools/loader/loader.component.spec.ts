/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;
  let element:any;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dis/appear when isLoading is false/true', () => {
    component.isLoading = false;
    expect(component.isLoading).toBeFalsy();
    fixture.detectChanges();
    expect(element.children.length).toEqual(0);

    component.isLoading = true;
    expect(component.isLoading).toBeTruthy();
    fixture.detectChanges();
    expect(element.children.length).toBeGreaterThan(0);

  });
});
