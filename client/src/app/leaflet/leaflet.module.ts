import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletComponent } from './leaflet.component';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { ApiHelperModule } from './api-helper/api-helper.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    JWBootstrapSwitchModule,
    ApiHelperModule
  ],
  declarations: [LeafletComponent]
})
export class LeafletModule {
}
