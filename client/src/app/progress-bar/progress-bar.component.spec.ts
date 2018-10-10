/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';

import { ProgressBarComponent } from './progress-bar.component';
import { ProgressBarModule } from './progress-bar.module';
import { AnimationHelperService } from '../animation-helper.service';

describe('LoaderComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;
  let element: any, animationHelperService: AnimationHelperService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ProgressBarModule],
      providers: [AnimationHelperService]
    })
      .compileComponents();
  }));

  beforeEach(inject([AnimationHelperService], (_animationHelperService: AnimationHelperService) => {
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
    animationHelperService = _animationHelperService;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden when isLoading is false', () => {
    component.isLoading = false;
    fixture.detectChanges();
    expect(element.children.length).toEqual(0);
    component.isLoading = true;
    fixture.detectChanges();
    expect(element.children.length).toBeGreaterThan(0);
  });


  it('should isLoading be "true" when percent eq zero', () => {
    component.percent = 0;
    component.ngOnChanges({ percent: {} });
    expect(component.isLoading).toBeTruthy();
  });


  it('should isLoading be "false" when percent eq 100', () => {
    component.percent = 100;
    component.ngOnChanges({ percent: {} });
    expect(component.isLoading).toBeFalsy();
  });

  it('should animationHelperService precentChangesEmiter to call emit with percent changed', fakeAsync(() => {
    spyOn(animationHelperService.precentChangesEmiter, 'emit');
    component.percent = 75;
    component.ngOnChanges({ percent: {} });
    tick(601);
    fixture.detectChanges();
    expect(animationHelperService.precentChangesEmiter.emit).toHaveBeenCalledWith(75);
  }));


});
