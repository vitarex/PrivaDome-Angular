import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesComponent } from './modules.component';
import { ApiModule } from '@app/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@app/material.module';
import { SharedModule } from '@app/shared';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@app/core';
import { DynamicFormComponent } from './moduleform/dynamic-form.component';
import { ModulesCreateDialogComponent } from './dialogs/modules-create-dialog';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog';
import { ModuleformComponent } from './moduleform/moduleform.component';
import { MatSelectModule, MatInputModule, MatCheckboxModule, MatButtonModule } from '@angular/material';

describe('ModulesComponent', () => {
  let component: ModulesComponent;
  let fixture: ComponentFixture<ModulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ApiModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        MaterialModule,
        SharedModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        CoreModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        FormsModule
      ],
      declarations: [
        ModulesComponent,
        DynamicFormComponent,
        ModulesCreateDialogComponent,
        ConfirmDialogComponent,
        ModuleformComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
