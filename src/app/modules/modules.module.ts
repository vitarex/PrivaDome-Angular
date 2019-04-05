import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { ModulesComponent } from './modules.component';
import { ModulesRoutingModule } from '@app/modules/modules-routing.module';
import { ModuleformComponent } from './moduleform/moduleform.component';
import { DynamicFormComponent } from './moduleform/dynamic-form.component';
import { MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule } from '@angular/material';
import { ModulesCreateDialogComponent } from './dialogs/modules-create-dialog';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog';

@NgModule({
  imports: [
    CommonModule,
    ModulesRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    FlexLayoutModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule
  ],
  declarations: [
    ModulesComponent,
    ModuleformComponent,
    DynamicFormComponent,
    ModulesCreateDialogComponent,
    ConfirmDialogComponent
  ],
  entryComponents: [ModuleformComponent, DynamicFormComponent, ModulesCreateDialogComponent, ConfirmDialogComponent]
})
export class ModulesModule {}
