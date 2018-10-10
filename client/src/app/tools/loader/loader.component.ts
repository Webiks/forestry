import {Component, OnInit, Input} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(
        ':enter', [
          style({opacity: 0}),
          animate('100ms', style({opacity: 1})
          )]),
      transition(
        ':leave', [
          style({opacity: 1}),
          animate('100ms', style({opacity: 0}))
        ]
      )])
  ]
})
export class LoaderComponent implements OnInit {
  @Input('show') isLoading;
  constructor() { }

  ngOnInit() {
  }

}
