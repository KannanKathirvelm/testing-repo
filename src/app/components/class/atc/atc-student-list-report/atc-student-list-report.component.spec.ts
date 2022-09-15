import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ATCStudentListReportComponent } from './atc-student-list-report.component';

describe('ATCStudentListReportComponent', () => {
  let component: ATCStudentListReportComponent;
  let fixture: ComponentFixture<ATCStudentListReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ATCStudentListReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ATCStudentListReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
