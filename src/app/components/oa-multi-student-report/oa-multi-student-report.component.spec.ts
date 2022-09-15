import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OaMultiStudentReportComponent } from './oa-multi-student-report.component';

describe('MilestoneCollectionReportComponent', () => {
  let component: OaMultiStudentReportComponent;
  let fixture: ComponentFixture<OaMultiStudentReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OaMultiStudentReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OaMultiStudentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
