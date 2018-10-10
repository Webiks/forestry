import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { StateService } from '@uirouter/angular';
import { APP_BASE_HREF } from '@angular/common';
import { AppModule } from '../app.module';
import { LoginService } from '../login/login.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let element: any;
  let stateServie: StateService;
  let loginService: LoginService;

  let welcome_link;
  let cesium_link;
  let leaflet_link;
  let openlayers_link;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        AppModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/cesium' }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);

    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
    component.ngOnInit();
    stateServie = TestBed.get(StateService);
    loginService = TestBed.get(LoginService);
    welcome_link = element.querySelector('a[ng-reflect-state=\'Welcome\'');
    cesium_link = element.querySelector('a[ng-reflect-state=\'App.Cesium\'');
    leaflet_link = element.querySelector('a[ng-reflect-state=\'App.Leaflet\'');
    openlayers_link = element.querySelector('a[ng-reflect-state=\'App.Openlayers\'');

  });

  it('should ul include all states ', () => {
    let ul = element.querySelector('ul');
    fixture.detectChanges();
    expect(ul.children.length).toEqual(3); // App.Cesium, App.Leaflet, App.Openlayers
  });

  it('getPureName() should return the name after the last dot ', () => {
    let cesium_link = element.querySelector('a[ng-reflect-state=\'App.Cesium\'');
    let leaflet_link = element.querySelector('a[ng-reflect-state=\'App.Leaflet\'');
    let openlayers_link = element.querySelector('a[ng-reflect-state=\'App.Openlayers\'');

    expect(component.getPureName('App.Cesium')).toEqual('Cesium');
    expect(component.getPureName('App.Leaflet')).toEqual('Leaflet');
    expect(component.getPureName('App.Openlayers')).toEqual('Openlayers');
    expect(component.getPureName('A.B.C.D.E.F.G')).toEqual('G');

    expect(cesium_link.textContent).toEqual('Cesium');
    expect(leaflet_link.textContent).toEqual('Leaflet');
    expect(openlayers_link.textContent).toEqual('Openlayers');

  });


  it('click on sref buttons should call stateService.go function:', () => {
    spyOn(stateServie, 'go');
    welcome_link.click();
    expect(stateServie.go).toHaveBeenCalledWith('Welcome', undefined, { relative: '', inherit: true, source: 'sref' });
    cesium_link.click();
    expect(stateServie.go).toHaveBeenCalledWith('App.Cesium', undefined, { relative: '', inherit: true, source: 'sref' });
    leaflet_link.click();
    expect(stateServie.go).toHaveBeenCalledWith('App.Leaflet', undefined, { relative: '', inherit: true, source: 'sref' });
    openlayers_link.click();
    expect(stateServie.go).toHaveBeenCalledWith('App.Openlayers', undefined, { relative: '', inherit: true, source: 'sref' });
  });


  it('click on logOut button should call loginService.logOut function:', () => {
    spyOn(loginService, 'logOut');

    let logout_link = element.querySelector('.logout');
    logout_link.click();
    expect(loginService.logOut).toHaveBeenCalled();
  });


});
