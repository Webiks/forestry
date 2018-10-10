import { Component, Input, OnChanges } from '@angular/core';
import { AnimationHelperService } from '../animation-helper.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-progress-bar',
  templateUrl: 'progress-bar.component.html',
  styleUrls: ['progress-bar.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(
        ':enter', [
          style({ opacity: 0 }),
          animate('100ms', style({ opacity: 1 })
          )]),
      transition(
        ':leave', [
          style({ opacity: 1 }),
          animate('100ms', style({ opacity: 0 }))
        ]
      )])
  ]
})
export class ProgressBarComponent implements OnChanges {
  public isLoading: boolean;

  @Input() percent: number;

  constructor(private animationHelperService: AnimationHelperService) {
  }

  ngOnChanges(changes) {
    if (changes.percent) {
      if (this.percent == 0) this.isLoading = true;

      setTimeout(() => {
        this.animationHelperService.precentChangesEmiter.emit(this.percent);
        if (this.percent == 100) this.isLoading = false;
      }, 200);

    }
  }

  getType() {
    if (this.percent < 50) {
      return 'danger';
    } else if (this.percent < 75) {
      return 'warning';
    } else if (this.percent < 100) {
      return 'info';
    } else {
      return 'success';
    }
  }

  // getStyleViaFontSize() {
  //   return {fontSize: `${this.fontSize}px`, top: `calc(50% - ${this.fontSize/2}px)`};
  // }

}
