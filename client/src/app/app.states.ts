import { CesiumComponent } from './cesium/cesium.component';
import { LeafletComponent } from './leaflet/leaflet.component';
import { Ng2StateDeclaration, UIRouterGlobals } from '@uirouter/angular';
import { OpenlayersComponent } from './openlayers/openlayers.component';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { AnimationHelperService } from './animation-helper.service';

export const loggedin_authenticate = [LoginService, function (loginService: LoginService) {
  return loginService.authenticate();
}];
export const loggedout_authenticate = [LoginService, function (loginService: LoginService) {
  return new Promise(function (resolve, reject) {
    return loginService.authenticate().then(reject, resolve);
  });
}];
export const transitionMaps = [UIRouterGlobals, AnimationHelperService, function (globals: UIRouterGlobals, animationHelperService: AnimationHelperService) {
  const fromName = globals.transition.from().name;
  const needResolve = fromName === 'App.Cesium' || fromName === 'App.Openlayers' || fromName === 'App.Leaflet';
  if (!needResolve) {
    return;
  }
  const promise: Promise<any> = new Promise<any>(function (res, rej) {
    animationHelperService.leavingEmiter.subscribe(res);
  });
  animationHelperService.beforeLeavingEmiter.emit();
  return promise;
}];


export const states: Array<Ng2StateDeclaration> = [
  {
    name: 'Welcome',
    component: WelcomeComponent,
    url: '/',
    resolve: { loggedin_authenticate }
  },
  {
    name: 'App',
    component: AppComponent,
    abstract: true,
    resolve: { loggedin_authenticate }
  },
  {
    name: 'App.Cesium',
    component: CesiumComponent,
    url: 'cesium',
    resolve: { transitionMaps }
  },
  {
    name: 'App.Leaflet',
    component: LeafletComponent,
    url: 'leaflet?api',
    resolve: { transitionMaps }
  },
  {
    name: 'App.Openlayers',
    component: OpenlayersComponent,
    url: 'openlayers',
    resolve: { transitionMaps }
  },
  {
    name: 'Login',
    component: LoginComponent,
    url: 'login',
    resolve: { loggedout_authenticate }
  }
];

