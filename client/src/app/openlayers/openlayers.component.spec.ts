/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenlayersComponent } from './openlayers.component';
import { AppModule } from '../app.module';
import { HelperService } from '../helper.service';
import { Observable } from 'rxjs';
import { HelperServiceMock } from '../../test';

describe('OpenlayersComponent', () => {
  let component: OpenlayersComponent;
  let fixture: ComponentFixture<OpenlayersComponent>;
  let helperService: HelperService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: HelperService, useClass: HelperServiceMock }]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    helperService = TestBed.get(HelperService);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    spyOn(helperService, 'getTmsmapresource').and.callFake(() => {
      return new Observable<any>(obs => {
        obs.next({
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
        });
      });
    });
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
    expect(component.map.getLayers().getArray().indexOf($event.item.layer)).not.toEqual(-1);


    //remove tms (tile map service) from map!
    $event.item.checked = false;
    component.onClickTmsItem($event);
    expect(component.map.getLayers().getArray().indexOf($event.item.layer)).toEqual(-1);


    $event.item.checked = true;
    $event.notFly = false;

    //create tms (tile map service) on map with flyTo!
    component.onClickTmsItem($event);
    expect($event.item.layer).toBeDefined();
    expect(component.flyToLayer).toHaveBeenCalledWith({ layer: $event.item.layer });
    expect(component.map.getLayers().getArray().indexOf($event.item.layer)).not.toEqual(-1);

  });

});
