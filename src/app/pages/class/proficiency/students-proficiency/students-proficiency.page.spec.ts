import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentsProficiencyPage } from './students-proficiency.page';

describe('StudentsProficiencyPage', () => {
  let component: StudentsProficiencyPage;
  let fixture: ComponentFixture<StudentsProficiencyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentsProficiencyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsProficiencyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
