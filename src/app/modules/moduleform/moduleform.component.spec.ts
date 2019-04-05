import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleformComponent } from './moduleform.component';
import { ApiModule, ModuleSchema, ModulePolicy } from '@app/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@app/material.module';
import { SharedModule } from '@app/shared';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@app/core';
import { MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule } from '@angular/material';
import { DynamicFormComponent } from './dynamic-form.component';
import { Component } from '@angular/core';

describe('ModuleformComponent', () => {
  let testHostComponent: ModuleFormTestComponent;
  let testHostFixture: ComponentFixture<ModuleFormTestComponent>;

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
      declarations: [ModuleformComponent, DynamicFormComponent, ModuleFormTestComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(ModuleFormTestComponent);
    testHostComponent = testHostFixture.componentInstance;
    testHostFixture.detectChanges();
  });

  it('should create', () => {
    expect(testHostComponent).toBeTruthy();
  });
});

@Component({
  selector: 'app-moduleform-test-cmp',
  template:
    '<app-moduleform\
      [moduleSchema]="mockSchema"\
      [modulePolicies]="mockPolicies"\
      networkActive="false"></app-moduleform>'
})
class ModuleFormTestComponent {
  mockSchema: ModuleSchema = {
    friendlyName: 'SocialBlock',
    id: 'socialblock',
    inputs: [
      {
        description: 'You can turn SPECIALS on. (default off)',
        id: 'specialblock',
        name: 'SpecialBlock',
        type: 'checkbox'
      },
      {
        description: 'Give what special effect you need.',
        id: 'specialeffect',
        name: 'SpecialEffect',
        type: 'checkbox',
        options: ['Instagram', 'Facebook', 'Twitter']
      }
    ]
  };

  mockPolicies: ModulePolicy[] = [
    {
      active_period: {
        day: [0, 1, 2, 3, 4, 5, 6],
        start: [0, 0],
        end: [22, 0]
      },
      blocking: true,
      options: {
        specialblock: true,
        specialeffect: 'Instagram'
      }
    }
  ];
}
