import {Injectable, Output, EventEmitter} from '@angular/core';
import {HelperService} from "../helper.service";
import {AnimationHelperService} from "../animation-helper.service";

@Injectable()
export class ToolsService {
  gridEmmiter = new EventEmitter();
  @Output() onClickRasterItemOutput = new EventEmitter();
  @Output() flyToLayerOutput = new EventEmitter();
  @Output() onClickVectorItemOutput  = new EventEmitter();

  public onClickRasterItemSubscriber:any;
  public flyToLayerSubscriber:any;
  public onClickVectorItemSubscriber:any;

  public dropdowns:{rasters:Dropdown, points:Dropdown, polygons:Dropdown} = {rasters:new Dropdown("Rasters"), points:new Dropdown("Points"), polygons:new Dropdown("Polygons")};
  public position:([number, number, number, number] | undefined);
  public zoomText = '';
  public zoomInput:Function = () => {
    return "no zoom";
  };
  public lat;
  public lng;


  constructor(private helperService:HelperService, private animationHelperService:AnimationHelperService) {}

  dataRastersAndVectors():void {
    this.helperService.getRastersList().subscribe(res=> {
      this.dropdowns.rasters.isLoading = false;
      this.dropdowns.rasters.list = res;
      this.dropdowns.rasters.finishLoading.emit();
    });

    this.helperService.getPolygonsList().subscribe(res=> {
      this.dropdowns.polygons.isLoading = false;
      this.dropdowns.polygons.list = res;
      this.dropdowns.polygons.finishLoading.emit();

      var obs_array = [];
      this.dropdowns.polygons.list.forEach((point) => {
        point.loadingEmitter = new EventEmitter();
        obs_array.push(this.helperService.getGeojson(point.url).toPromise());
      });
      Promise.all(obs_array).then((results:Array<any>) => {
        results.forEach((_geojsonData, index)=>{
          let polygon = this.dropdowns.polygons.list[index];
          polygon.geojsonData = _geojsonData;
          polygon.loading = false;
          polygon.loadingEmitter.emit();
        })
      })

    });

    this.helperService.getPointsList().subscribe(res => {
      this.dropdowns.points.isLoading = false;
      this.dropdowns.points.list = res;
      this.dropdowns.points.finishLoading.emit();
      var obs_array = [];
      this.dropdowns.points.list.forEach((point) => {
        point.loadingEmitter = new EventEmitter();
        obs_array.push(this.helperService.getGeojson(point.url).toPromise());
        // this.helperService.getGeojson(point.url).subscribe(_geojsonData => {
        //   point.geojsonData = _geojsonData;
        // })
      });

      Promise.all(obs_array).then((results:Array<any>) => {
        results.forEach((_geojsonData, index)=>{
          let point = this.dropdowns.points.list[index];
          point.geojsonData = _geojsonData;
          point.loading = false;
          point.loadingEmitter.emit();
        })
      })
    });
  }

  onSubscribeGeojson() {

  }

  initSubscribers(componentInstance) {
    this.onClickRasterItemSubscriber  = this.onClickRasterItemOutput.subscribe(($event) => {componentInstance.onClickRasterItem($event)});
    this.flyToLayerSubscriber         = this.flyToLayerOutput.subscribe(($event) => {componentInstance.flyToLayer($event)});

    this.onClickVectorItemSubscriber  = this.onClickVectorItemOutput.subscribe(($event) => {
      let precentChangesSubscriber = this.animationHelperService.precentChangesEmiter.subscribe( (precent:number) => {
        switch (precent) {
          case 0:
            this.animationHelperService.setProgressBarPrecent(50);
            break;
          case 50:
            this.animationHelperService.setProgressBarPrecent(75);
            break;
          case 75:
            componentInstance.onClickVectorItem($event).subscribe(null, null, () => {
              this.animationHelperService.completeProgressBar();
            });
          break;
          case 100:
            precentChangesSubscriber.unsubscribe();
            break;
        }
      });
      this.animationHelperService.initProgressBar();
    });
  }

  destroySubscribers() {
    this.onClickRasterItemSubscriber.unsubscribe();
    this.flyToLayerSubscriber.unsubscribe();
    this.onClickVectorItemSubscriber.unsubscribe();
  }


}

class Dropdown{
  public isOpen:boolean = false;
  public list:Array<any> = [];
  public disabled:boolean = false;
  public isLoading:boolean = true;
  public finishLoading = new EventEmitter()
  constructor(public Name) {}
}
