import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentProficiencyPage } from './student-proficiency.page';

describe('StudentProficiencyPage', () => {
  let component: StudentProficiencyPage;
  let fixture: ComponentFixture<StudentProficiencyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentProficiencyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentProficiencyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
