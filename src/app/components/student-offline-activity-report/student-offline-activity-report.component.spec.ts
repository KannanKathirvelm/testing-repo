import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { StudentOfflineActivityReportComponent } from './student-offline-activity-report.component';

describe('StudentOfflineActivityReportComponent', () => {
  let component: StudentOfflineActivityReportComponent;
  let fixture: ComponentFixture<StudentOfflineActivityReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentOfflineActivityReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();
    fixture = TestBed.createComponent(StudentOfflineActivityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
