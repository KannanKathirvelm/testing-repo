import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AtcChartViewComponent } from './atc-chart-view.component';

describe('AtcChartViewComponent', () => {
  let component: AtcChartViewComponent;
  let fixture: ComponentFixture<AtcChartViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtcChartViewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AtcChartViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
