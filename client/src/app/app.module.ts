import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CesiumModule } from './cesium/cesium.module';
import { UIRouterModule } from '@uirouter/angular';
import { states } from './app.states';
import { LeafletModule } from './leaflet/leaflet.module';
import { HelperService } from './helper.service';
import { OpenlayersModule } from './openlayers/openlayers.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { ToolsModule } from './tools/tools.module';
import { AnimationHelperService } from './animation-helper.service';
import { ProgressBarModule } from './progress-bar/progress-bar.module';
import { LoginModule } from './login/login.module';
import { ContainerComponent } from './container/container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    WelcomeComponent,
    ContainerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    CesiumModule,
    LeafletModule,
    OpenlayersModule,
    ToolsModule,
    ProgressBarModule,
    LoginModule,
    UIRouterModule.forRoot({
      states,
      useHash: true,
      otherwise: { state: 'Login' }
    })
  ],
  providers: [HelperService, AnimationHelperService],
  bootstrap: [ContainerComponent]
})
export class AppModule {
}
