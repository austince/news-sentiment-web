/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NewsWebComponent } from './news-web.component';

describe('NewsWebComponent', () => {
  let component: NewsWebComponent;
  let fixture: ComponentFixture<NewsWebComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsWebComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
