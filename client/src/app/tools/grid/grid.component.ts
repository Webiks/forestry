import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { SERVER_BASE_URL } from '../../helper.service';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  name = 'Grilla Mautnershp';
  array = [
    {
      name: 'Grilla Mautnershp',
      url: `${SERVER_BASE_URL}/DATA/UPM/GRID/Grilla Mautnershp.geojson`,
      checked: false,
      data_item: undefined,
      image_url: '/assets/pic.jpg'
    }

  ];
  isOpen: boolean;

  constructor(private http: Http, public toolsService: ToolsService) {
  }

  ngOnInit() {

  }

}
