import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {LoginComponent} from "./login.component";
import {LoginService} from "./login.service";
import {CookieService} from "angular2-cookie/services/cookies.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [LoginComponent],
  providers:[LoginService, CookieService]
})
export class LoginModule {}
