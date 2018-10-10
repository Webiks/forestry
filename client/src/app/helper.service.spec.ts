/* tslint:disable:no-unused-variable */

import {TestBed, async, inject } from '@angular/core/testing';
import {HttpModule} from "@angular/http";
import {HelperService} from "./helper.service";
import {without_points, only_points} from "./cesium/cesium.component.spec";
import {Observable} from "rxjs";
import * as _ from 'lodash';

let helperService:HelperService;

describe('Service: HelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HelperService],
      imports: [HttpModule]
    });
  });

  beforeEach(inject([HelperService], (_helperService: HelperService)  => {
    helperService = _helperService;
  }));


  it('should HelperService to be defined', () => {
    expect(helperService).toBeDefined();
    expect(helperService.CESIUM_BASE_URL).toEqual('assets/Cesium')
  });

  it('should getColorByItemName return the right color(string)', () => {
    expect(helperService.getColorByItemName("normal_name")).toEqual("CHARTREUSE");
    expect(helperService.getColorByItemName("name_with_Suspected_inside")).toEqual("yellow");
    expect(helperService.getColorByItemName("name_with_Missing_inside")).toEqual("red");
  });

  it('should getSplitGeojsonData to split geojson object to only_points and without_points ', async(() => {
    let both = _.cloneDeep(without_points);
    // both.features = both.features.concat(only_points.features);
    both.features = <Object[]> _.concat(<Object[]>both.features, <Object[]>only_points.features);
    spyOn(helperService, 'getGeojson').and.returnValue(new Observable<any>(obs=>{
      obs.next(both);
    }));
    helperService.getSplitGeojsonData({url:'url_to_geojson'}).subscribe((res:{without_points:any, only_points:any})=>{
      expect(res.without_points).toEqual(without_points);
      expect(res.only_points).toEqual(only_points);
    });

  }));

});
