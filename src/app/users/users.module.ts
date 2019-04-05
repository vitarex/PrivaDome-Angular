import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent, UsersDialogComponent } from './users.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    UsersRoutingModule
  ],
  entryComponents: [UsersDialogComponent],
  declarations: [UsersComponent, UsersDialogComponent]
})
export class UsersModule {}
