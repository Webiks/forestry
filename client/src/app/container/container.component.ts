import { Component, OnInit } from '@angular/core';
import {ToolsService} from "../tools/tools.service";

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  constructor(private toolsService:ToolsService) { }

  ngOnInit() {
    this.toolsService.dataRastersAndVectors();
  }

}
