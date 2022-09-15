import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DomainCompetencyPage } from './domain-competency.page';

describe('DomainCompetencyPage', () => {
  let component: DomainCompetencyPage;
  let fixture: ComponentFixture<DomainCompetencyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DomainCompetencyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DomainCompetencyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
