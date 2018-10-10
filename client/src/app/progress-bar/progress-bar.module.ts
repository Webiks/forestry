import { NgModule } from '@angular/core';
import { ProgressBarComponent } from './progress-bar.component';
import { CommonModule } from '@angular/common';
import { ProgressbarModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    ProgressbarModule.forRoot()
  ],
  declarations: [ProgressBarComponent],
  exports: [ProgressBarComponent]
})
export class ProgressBarModule {
}
