/* tslint:disable:no-unused-variable */

import { inject, TestBed } from '@angular/core/testing';
import { AnimationHelperService } from './animation-helper.service';

describe('Service: AnimationRouting', () => {
  let animationHelperService: AnimationHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimationHelperService]
    });
  });
  beforeEach(inject([AnimationHelperService], (_animationHelperService: AnimationHelperService) => {
    animationHelperService = _animationHelperService;
  }));

  it('should animationHelperService be defined', () => {
    expect(animationHelperService).toBeDefined();
  });

  it('should initProgressBar to make generalProgressBarPercent to equal zero', () => {
    animationHelperService.initProgressBar();
    expect(animationHelperService.generalProgressBarPercent).toEqual(0);
  });


  it('should completeProgressBar to make generalProgressBarPercent to equal 100', () => {
    animationHelperService.completeProgressBar();
    expect(animationHelperService.generalProgressBarPercent).toEqual(100);
  });

  it('should hideState to make fadeOutValue to equal "hide"', () => {
    animationHelperService.hideState();
    expect(animationHelperService.fadeOutValue).toEqual('hide');
  });

  it('should hideCesiumState to make fadeOutValue to equal "hideCesium"', () => {
    animationHelperService.hideCesiumState();
    expect(animationHelperService.fadeOutValue).toEqual('hideCesium');
  });

  it('should stayState to make fadeOutValue to equal ""', () => {
    animationHelperService.stayState();
    expect(animationHelperService.fadeOutValue).toEqual('');
  });

});
