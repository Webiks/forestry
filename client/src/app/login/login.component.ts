import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { StateService } from '@uirouter/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public login: { email: string, password: string } = { email: '', password: '' };
  public errorMsg: string;

  constructor(private loginService: LoginService, private stateService: StateService) {
    loginService.clearToken();
  }

  submitLogin() {
    let that = this;
    this.loginService.loginCredential(this.login.email, this.login.password).subscribe(
      res => {
        // that.stateService.go(this.loginService.lastState[0], this.loginService.lastState[1]);
        that.stateService.go('Welcome');
      },
      error => {
        that.errorMsg = error.json().message;
      }
    );
  }

  ngOnInit() {
  }

}
