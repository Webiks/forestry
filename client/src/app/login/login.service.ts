import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { Observable } from 'rxjs';
import { UIRouter } from '@uirouter/angular';
import { SERVER_BASE_URL } from '../helper.service';

@Injectable()
export class LoginService {
  public AccessToken: string;
  public lastState: [string, any] = ['App.Cesium', {}];

  constructor(private http: Http, private cookieService: CookieService, private uiRouter: UIRouter) {

    uiRouter.transitionService.onError({ from: () => uiRouter.globals.transition.to().name != 'Login' }, () => {
      this.lastState = [uiRouter.globals.transition.to().name, uiRouter.globals.transition.params()];
      uiRouter.stateService.go('Login');
    });

    uiRouter.transitionService.onError({ to: 'Login' }, () => {
      uiRouter.stateService.go('App.Cesium');
    });

  }

  loginCredential(email: string, password: string) {
    let that = this;
    return this.http.post(`${SERVER_BASE_URL}/api/login`, { email: email, password }).map(
      (res: Response) => {
        let result = res.json();
        that.putToken(result.token);
        return result;
      });
  };

  loginToken(): Observable<any> {
    let that = this;
    let token: string = this.cookieService.get('token');

    return this.http.post(`${SERVER_BASE_URL}/api/login`, { token: token }).map(
      (res: Response) => {
        let result = res.json();
        that.putToken(result.token);
        return result;
      });
  };

  logOut() {
    this.clearToken();
    this.uiRouter.stateService.go('Login');
  };

  authenticate() {
    let that = this;
    return new Promise((resolve, reject) => {
      if (this.isAuthenticate()) {
        resolve();
      } else if (!this.cookieService.get('token')) {
        reject();
      } else {
        that.loginToken().subscribe(
          () => {
            resolve();
          },
          () => {
            reject();
          }
        );
      }
    });
  }

  clearToken() {
    this.cookieService.put('token', undefined);
    this.AccessToken = undefined;
  }

  putToken(token: string) {
    this.cookieService.put('token', token);
    this.AccessToken = token;
  };

  isAuthenticate() {
    return (this.AccessToken != undefined && this.cookieService.get('token') != undefined && this.cookieService.get('token') == this.AccessToken);
  }
}
