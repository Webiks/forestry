import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CesiumComponent } from './cesium.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [CesiumComponent]
})
export class CesiumModule {
}
