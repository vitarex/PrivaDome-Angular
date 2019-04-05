import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';
import { MockApiService } from './api.service.mock';
import { environment } from 'environments/environment';

@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: ApiService,
      useClass: environment.production ? ApiService : ApiService
    }
  ],
  declarations: []
})
export class ApiModule {}
