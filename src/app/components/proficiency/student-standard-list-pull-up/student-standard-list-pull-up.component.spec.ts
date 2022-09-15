import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentStandardListPullUpComponent } from './student-standard-list-pull-up.component';

describe('StudentStandardListPullUpComponent', () => {
  let component: StudentStandardListPullUpComponent;
  let fixture: ComponentFixture<StudentStandardListPullUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentStandardListPullUpComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentStandardListPullUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
