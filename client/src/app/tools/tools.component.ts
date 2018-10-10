import { Component, OnInit } from '@angular/core';
import { ToolsService } from './tools.service';
import { UIRouter } from '@uirouter/angular';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {


  constructor(public toolsService: ToolsService, public uiRouter: UIRouter) {

  }

  ngOnInit() {

  }

  gridShow(): boolean {
    return location.origin.includes('terrabiks.upm') && this.uiRouter.stateService.current.name === 'App.Cesium';
  }

}

