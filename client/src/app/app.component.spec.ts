/* tslint:disable:no-unused-variable */

import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { APP_BASE_HREF } from '@angular/common';
import { LeafletComponent } from './leaflet/leaflet.component';
import { OpenlayersComponent } from './openlayers/openlayers.component';
import { CesiumComponent } from './cesium/cesium.component';
import { AppModule } from './app.module';
import { HelperService } from './helper.service';
import { HelperServiceMock } from '../test';

declare var Cesium;

describe('App: CesNg2', () => {

  beforeEach(() => {
    TestBed.overrideComponent(CesiumComponent, { set: { template: 'cesium work' } });
    TestBed.overrideComponent(LeafletComponent, { set: { template: 'leaflet work' } });
    TestBed.overrideComponent(OpenlayersComponent, { set: { template: 'openlayers work' } });

    TestBed.configureTestingModule({
      imports: [
        AppModule
      ],
      providers: [
        { provide: HelperService, useClass: HelperServiceMock },
        { provide: APP_BASE_HREF, useValue: '/' }]
    });
  });

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

});
