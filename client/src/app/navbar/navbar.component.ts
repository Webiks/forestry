import { Component, OnInit } from '@angular/core';
import { Ng2StateDeclaration } from '@uirouter/angular';
import { states } from '../app.states';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public app_states: Array<Ng2StateDeclaration>;

  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
    this.app_states = states.filter(state => state.name.includes('App.'));
  }

  getPureName(name: string) {
    let split_points: Array<string> = name.split('.');
    return split_points[split_points.length - 1];
  }


}
