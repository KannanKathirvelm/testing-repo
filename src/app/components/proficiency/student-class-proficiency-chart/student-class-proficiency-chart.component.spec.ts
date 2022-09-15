import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentClassProficiencyChartComponent } from './student-class-proficiency-chart.component';

describe('StudentClassProficiencyChartComponent', () => {
  let component: StudentClassProficiencyChartComponent;
  let fixture: ComponentFixture<StudentClassProficiencyChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudentClassProficiencyChartComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentClassProficiencyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
