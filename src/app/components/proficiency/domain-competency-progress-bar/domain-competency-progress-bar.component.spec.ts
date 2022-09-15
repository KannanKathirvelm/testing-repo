import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DomainCompetenciesComponent } from './domain-competency-progress-bar.component';

describe('DomainCompetenciesComponent', () => {
  let component: DomainCompetenciesComponent;
  let fixture: ComponentFixture<DomainCompetenciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DomainCompetenciesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DomainCompetenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
