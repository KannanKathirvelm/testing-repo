import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { StudentOfflineActivityContentReportComponent } from './student-offline-activity-content-report.component';

describe('OfflineActivityContentReportComponent', () => {
  let component: StudentOfflineActivityContentReportComponent;
  let fixture: ComponentFixture<StudentOfflineActivityContentReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentOfflineActivityContentReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();
    fixture = TestBed.createComponent(StudentOfflineActivityContentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
