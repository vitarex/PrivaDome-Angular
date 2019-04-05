import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { HomeComponent } from './home.component';
import { ApiModule } from '@app/api';
import { ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { NumericTileComponent } from './numerictile/numerictile.component';
import { ChartTileComponent } from './charttile/charttile.component';
import { AngularFittextModule } from 'angular-fittext';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ApiModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        MaterialModule,
        CoreModule,
        SharedModule,
        AngularFittextModule
      ],
      declarations: [HomeComponent, NumericTileComponent, ChartTileComponent]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ChartTileComponent, NumericTileComponent]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngAfterViewInit();
  });

  it('should create', done => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    done(); // waits for promise to complete
  });
});
