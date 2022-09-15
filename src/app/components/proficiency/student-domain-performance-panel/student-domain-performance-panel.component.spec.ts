import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentDomainPerformancePanelComponent } from './student-domain-performance-panel.component';

describe('StudentDomainPerformancePanelComponent', () => {
  let component: StudentDomainPerformancePanelComponent;
  let fixture: ComponentFixture<StudentDomainPerformancePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentDomainPerformancePanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDomainPerformancePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
