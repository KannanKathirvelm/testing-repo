import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AtcLearningStrugglesPanelComponent } from './atc-learning-struggles-panel.component';

describe('AtcLearningStrugglesPanelComponent', () => {
  let component: AtcLearningStrugglesPanelComponent;
  let fixture: ComponentFixture<AtcLearningStrugglesPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtcLearningStrugglesPanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AtcLearningStrugglesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
