import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenlayersComponent } from './openlayers.component';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';

@NgModule({
  imports: [
    CommonModule,
    JWBootstrapSwitchModule
  ],
  declarations: [OpenlayersComponent]
})
export class OpenlayersModule {
}
