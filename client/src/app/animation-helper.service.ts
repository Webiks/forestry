import { EventEmitter, Injectable, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Injectable()
export class AnimationHelperService {

  public fadeOutValue: string = '';
  public generalProgressBarPercent: number = 0;

  @Output() beforeLeavingEmiter = new EventEmitter();
  @Output() leavingEmiter = new EventEmitter();
  @Output() afterLeavingEmiter = new EventEmitter();

  @Output() precentChangesEmiter = new EventEmitter();

  constructor() {
    let afterLeavingSubscriber = this.afterLeavingEmiter.subscribe(() => {
      afterLeavingSubscriber.unsubscribe();
      this.setProgressBarPrecent(75);
    });
  }

  setProgressBarPrecent(precent: number) {
    this.generalProgressBarPercent = precent;
  }

  initProgressBar() {
    this.setProgressBarPrecent(0);
  }

  completeProgressBar() {
    this.setProgressBarPrecent(100);
  }

  hideState() {
    this.fadeOutValue = 'hide';
  }

  hideCesiumState() {
    this.fadeOutValue = 'hideCesium';
  }

  stayState() {
    this.fadeOutValue = '';
  }
}


export let animations = [
  trigger('fadeOutAnimation', [
    state('hide', style({ opacity: 0 })),
    state('hideCesium', style({ opacity: 0 })),
    transition('* => hide', [
      style({ opacity: 1 }),
      animate('0.25s')]
    ),
    transition('* => hideCesium', [
      style({ opacity: 1 }),
      animate('1s')]
    )])
];
