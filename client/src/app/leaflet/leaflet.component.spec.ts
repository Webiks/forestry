/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as L from 'leaflet';
import { LeafletComponent } from './leaflet.component';
import { AppModule } from '../app.module';
import { HelperService } from '../helper.service';
import { HelperServiceMock } from '../../test';
import { Observable } from 'rxjs';

describe('LeafletComponent', () => {
  let component: LeafletComponent;
  let fixture: ComponentFixture<LeafletComponent>;
  let helperService: HelperService;
  let manyPointsGeojson, only_points, without_points;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: HelperService, useClass: HelperServiceMock }]
    })
      .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    helperService = TestBed.get(HelperService);
    helperService.getGeojson('base/src/assets/Test/Points/points.geojson').subscribe(many_points => {
      manyPointsGeojson = many_points;

      helperService.getSplitGeojsonData({
        url: '',
        geojsonData: manyPointsGeojson
      }).subscribe((res: { only_points: any, without_points: any }) => {
        only_points = res.only_points;
        without_points = res.without_points;
      });
    });

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('flyToLayer should call flyToBounds with layer bounds', () => {

    spyOn(component.mymap, 'flyToBounds');
    let $event = {
      layer: {
        options: {
          bounds: L.latLngBounds(<L.LatLngTuple>[0, 0], <L.LatLngTuple>[0, 0])
        }
      }
    };
    component.flyToLayer($event);
    expect(component.mymap.flyToBounds).toHaveBeenCalledWith($event.layer.options.bounds);
  });

  it('onClickRasterItem should call the right function via the item type', () => {
    spyOn(component, 'onClickWmsItem');
    spyOn(component, 'onClickTmsItem');

    let $event = {
      item: {
        type: 'wms'
      }
    };

    component.onClickRasterItem($event);
    expect(component.onClickWmsItem).toHaveBeenCalledWith($event);

    $event.item.type = 'tms';

    component.onClickRasterItem($event);
    expect(component.onClickTmsItem).toHaveBeenCalledWith($event);

  });

  it(`onClickTmsItem() should
         1. call getTmsmapresource with item.url
         2. create tms layer with bounds and min/max zoom
         3. add the layer to map
         4. fly to layer bounds if need`, () => {

    spyOn(component, 'flyToLayer');
    spyOn(helperService, 'getTmsmapresource').and.returnValue(
      Observable.of({
        TileMap: {
          BoundingBox: [{
            $: {
              miny: -90,
              minx: -180,
              maxy: 90,
              maxx: 180
            }
          }],
          TileSets: [
            {
              TileSet: [
                { $: { order: 1 } },
                { $: { order: 2 } }
              ]
            }]
        }
      }));

    let $event: { item: any, notFly?: boolean } =
      {
        item: {
          url: 'base/src/assets/Test/TMS/ElRefugio_NUEVASec2_2agosto16_Comp',
          type: 'tms',
          checked: true
        },
        notFly: true
      };

    expect($event.item.layer).toBeUndefined();

    // create tms with no flyTo!
    component.onClickTmsItem($event);
    expect($event.item.layer).toBeDefined();
    expect(component.flyToLayer).not.toHaveBeenCalledWith({ layer: $event.item.layer });
    expect(component.mymap.hasLayer($event.item.layer)).toBeTruthy();


    //remove tms (tile map service) from map!
    $event.item.checked = false;
    component.onClickTmsItem($event);
    expect(component.mymap.hasLayer($event.item.layer)).toBeFalsy();

    $event.item.checked = true;
    $event.notFly = false;

    //create tms (tile map service) on map with flyTo!
    component.onClickTmsItem($event);
    expect($event.item.layer).toBeDefined();
    expect(component.flyToLayer).toHaveBeenCalledWith({ layer: $event.item.layer });
    expect(component.mymap.hasLayer($event.item.layer)).toBeTruthy();
  });


  it(`onClickWmsItem() should
         1. call getTmsmapresource with item.url
         2. create tms layer with bounds and min/max zoom
         3. add the layer to map
         4. fly to layer bounds if need`, () => {

    spyOn(component, 'flyToLayer');

    let $event: { item: any, notFly?: boolean } =
      {
        item: {
          url: 'base/src/assets/Test/TMS/ElRefugio_NUEVASec2_2agosto16_Comp',
          type: 'wms',
          checked: true,
          bounds: [1, 2, 3, 4],
          layers: 'layers:layer',
          name: 'layer'
        },
        notFly: true
      };

    expect($event.item.layer).toBeUndefined();

    // create wms with no flyTo!
    component.onClickWmsItem($event);
    expect($event.item.layer).toBeDefined();
    expect(component.flyToLayer).not.toHaveBeenCalledWith({ layer: $event.item.layer });
    expect(component.mymap.hasLayer($event.item.layer)).toBeTruthy();


    //remove wms (tile map service) from map!
    $event.item.checked = false;
    component.onClickWmsItem($event);
    expect(component.mymap.hasLayer($event.item.layer)).toBeFalsy();

    $event.item.checked = true;
    $event.notFly = false;

    //create wms (tile map service) on map with flyTo!
    component.onClickWmsItem($event);
    expect($event.item.layer).toBeDefined();
    expect(component.flyToLayer).toHaveBeenCalledWith({ layer: $event.item.layer });
    expect(component.mymap.hasLayer($event.item.layer)).toBeTruthy();
  });

  it(`onClickVectorItem  should
      1) call helperService.getSplitGeojsonData
      2) call normalGeojson to without_points data
      3) create manyPoints class `, async(() => {

    spyOn(component, 'normalGeojson');
    spyOn(component, 'manyPoints');
    spyOn(component.mymap, 'removeLayer');

    let $event: { item: any } =
      {
        item: {
          url: 'url_to_geojson',
          geojsonData: manyPointsGeojson,
          checked: true
        }
      };
    component.onClickVectorItem($event).subscribe(() => {
      expect(component.manyPoints).toHaveBeenCalledWith(only_points, $event.item);
      expect(component.normalGeojson).toHaveBeenCalledWith(without_points, $event.item);
      $event.item.checked = false;
      component.onClickVectorItem($event).subscribe(() => {
        expect(component.manyPoints).toHaveBeenCalledWith(only_points, $event.item);
        expect(component.normalGeojson).toHaveBeenCalledWith(without_points, $event.item);
      });
    });

  }));

  it('normalGeojson should create new layer of geojson ', () => {
    let item =
      {
        name: 'item',
        layer: null
      };

    component.normalGeojson(without_points, item);
    expect(item.layer).toBeDefined();
    expect(component.mymap.hasLayer(item.layer)).toBeTruthy();

  });

  it('manyPoints should create new manyPoints class with d3 only if more then 10000', async(() => {

    let item2 =
      {
        name: 'item2',
        layer: null,
        manyPoints: null
      };

    component.manyPoints(only_points, item2);
    expect(only_points.features.length).toBeGreaterThan(10000);
    expect(item2.manyPoints).toBeDefined();

  }));


});
