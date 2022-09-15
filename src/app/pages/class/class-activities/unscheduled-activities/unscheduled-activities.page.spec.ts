import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UnscheduledActivitiesPage } from './unscheduled-activities.page';

describe('UnscheduledActivitiesPage', () => {
  let component: UnscheduledActivitiesPage;
  let fixture: ComponentFixture<UnscheduledActivitiesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnscheduledActivitiesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnscheduledActivitiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
