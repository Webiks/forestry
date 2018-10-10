import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiHelperComponent } from './api-helper.component';
import { ApiHelperService } from './api-helper.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [ApiHelperComponent],
  exports: [ApiHelperComponent],
  providers: [ApiHelperService]
})
export class ApiHelperModule {
}
