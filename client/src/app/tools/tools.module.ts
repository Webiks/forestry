import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { ToolsComponent } from './tools.component';
import { ToolsService } from './tools.service';
import { LoaderComponent } from './loader/loader.component';
import { GridComponent } from './grid/grid.component';
import { BsDropdownModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    JWBootstrapSwitchModule,
    BsDropdownModule.forRoot()
  ],
  providers: [ToolsService],
  declarations: [ToolsComponent, LoaderComponent, GridComponent],
  exports: [ToolsComponent]
})
export class ToolsModule {
}
