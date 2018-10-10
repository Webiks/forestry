import { Component } from '@angular/core';
import { AnimationHelperService } from './animation-helper.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public animationHelperService: AnimationHelperService) {
  }
}
