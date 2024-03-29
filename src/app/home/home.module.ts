import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ChartTileComponent } from './charttile/charttile.component';
import { NumericTileComponent } from './numerictile/numerictile.component';
import { AngularFittextModule } from 'angular-fittext';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    HomeRoutingModule,
    AngularFittextModule
  ],
  declarations: [HomeComponent, ChartTileComponent, NumericTileComponent],
  entryComponents: [ChartTileComponent, NumericTileComponent]
})
export class HomeModule {}
