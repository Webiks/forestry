/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeComponent } from './welcome.component';
import {AppModule} from "../app.module";
import {APP_BASE_HREF} from "@angular/common";
import {StateService} from "@uirouter/angular";
import {HelperService} from "../helper.service";
import {HelperServiceMock} from "../../test";

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let element:any;
  let stateServie:StateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        AppModule,
      ],
      providers: [
        {provide: APP_BASE_HREF, useValue : '/cesium' },
        {provide: HelperService, useClass :HelperServiceMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
    stateServie = TestBed.get(StateService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    spyOn(stateServie, 'go');

    let cesium_sref = element.querySelector('.cesium');
    cesium_sref.click();
    expect(stateServie.go).toHaveBeenCalledWith('App.Cesium', undefined, { relative: '', inherit: true, source: 'sref' });
    let leaflet_sref = element.querySelector('.leaflet');
    leaflet_sref.click();
    fixture.detectChanges();
    expect(stateServie.go).toHaveBeenCalledWith('App.Leaflet', undefined, { relative: '', inherit: true, source: 'sref' });
    let openlayers_sref = element.querySelector('.openlayers');
    openlayers_sref.click();
    expect(stateServie.go).toHaveBeenCalledWith('App.Openlayers', undefined, { relative: '', inherit: true, source: 'sref' });

    expect(stateServie.go).toHaveBeenCalledTimes(3);
  });

});
