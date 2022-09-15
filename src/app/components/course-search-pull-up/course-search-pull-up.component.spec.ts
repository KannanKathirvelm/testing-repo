import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CourseSearchPullUpComponent } from './course-search-pull-up.component';

describe('CourseSearchPullUpComponent', () => {
  let component: CourseSearchPullUpComponent;
  let fixture: ComponentFixture<CourseSearchPullUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseSearchPullUpComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseSearchPullUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
