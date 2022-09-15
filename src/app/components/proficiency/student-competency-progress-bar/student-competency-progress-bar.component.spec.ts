import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentDomainCompetenciesComponent } from './student-competency-progress-bar.component';

describe('StudentDomainCompetenciesComponent', () => {
  let component: StudentDomainCompetenciesComponent;
  let fixture: ComponentFixture<StudentDomainCompetenciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentDomainCompetenciesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDomainCompetenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
