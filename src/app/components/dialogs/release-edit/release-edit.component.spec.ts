import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ReleaseEditComponent} from './release-edit.component';

describe('ReleaseEditComponent', () => {
  let component: ReleaseEditComponent;
  let fixture: ComponentFixture<ReleaseEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReleaseEditComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
