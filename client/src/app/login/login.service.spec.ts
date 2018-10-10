/* tslint:disable:no-unused-variable */

import { async, inject, TestBed } from '@angular/core/testing';
import { LoginService } from './login.service';
import { AppModule } from '../app.module';
import { UIRouter } from '@uirouter/angular';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { Http } from '@angular/http';
import { HelperServiceMock } from '../../test';
import { HelperService } from '../helper.service';

let loginService: LoginService;

describe('Service: Login', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: HelperService, useClass: HelperServiceMock }]
    });
  }));

  beforeEach(inject([LoginService], (_loginService: LoginService) => {
    loginService = _loginService;
  }));

  it('should be defined', () => {
    expect(loginService).toBeDefined();
  });


  it('should onError call 2 times on constructor', inject([Http, CookieService, UIRouter], (http: Http, cookieService: CookieService, uiRouter: UIRouter) => {
    spyOn(uiRouter.transitionService, 'onError');
    loginService.constructor(http, cookieService, uiRouter);
    expect(uiRouter.transitionService.onError).toHaveBeenCalledTimes(2);
  }));


  it('logOut should call clearToken and go to Login state', inject([UIRouter], (uiRouter: UIRouter) => {
    spyOn(uiRouter.stateService, 'go');
    spyOn(loginService, 'clearToken');
    loginService.logOut();
    expect(loginService.clearToken).toHaveBeenCalled();
    expect(uiRouter.stateService.go).toHaveBeenCalledWith('Login');
  }));

  it('clearToken and putToken should add/delete cookie and make put/remove the token on accessToken', inject([CookieService], (cookieService: CookieService) => {
    loginService.putToken('some_complected_token');
    expect(cookieService.get('token')).toEqual('some_complected_token');
    expect(loginService.AccessToken).toEqual('some_complected_token');
    loginService.clearToken();
    expect(cookieService.get('token')).toBeUndefined();
    expect(loginService.AccessToken).toBeUndefined();
  }));


  it('isAuthenticate should return true if AccessToken and cookie token are not empty and equals', () => {
    loginService.putToken('some_complected_token');
    expect(loginService.isAuthenticate()).toBeTruthy();
    loginService.clearToken();
    expect(loginService.isAuthenticate()).toBeFalsy();
  });
});
