import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AggregatedScorePanelComponent } from './aggregated-score-panel.component';

describe('AggregatedScorePanelComponent', () => {
  let component: AggregatedScorePanelComponent;
  let fixture: ComponentFixture<AggregatedScorePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregatedScorePanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AggregatedScorePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
