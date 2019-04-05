import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { LoaderComponent } from './loader/loader.component';
import { ChartFactoryService } from './chartfactory/chartfactory.service';

@NgModule({
  imports: [FlexLayoutModule, MaterialModule, CommonModule],
  declarations: [LoaderComponent],
  exports: [LoaderComponent],
  providers: [ChartFactoryService]
})
export class SharedModule {}
