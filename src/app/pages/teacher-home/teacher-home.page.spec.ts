import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TeacherHomePage } from './teacher-home.page';

describe('TeacherHomePage', () => {
  let component: TeacherHomePage;
  let fixture: ComponentFixture<TeacherHomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherHomePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
