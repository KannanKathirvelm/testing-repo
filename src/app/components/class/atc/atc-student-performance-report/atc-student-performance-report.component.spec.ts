import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ATCStudentPerformanceReportComponent } from './atc-student-performance-report.component';

describe('ATCStudentPerformanceReportComponent', () => {
  let component: ATCStudentPerformanceReportComponent;
  let fixture: ComponentFixture<ATCStudentPerformanceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ATCStudentPerformanceReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ATCStudentPerformanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
