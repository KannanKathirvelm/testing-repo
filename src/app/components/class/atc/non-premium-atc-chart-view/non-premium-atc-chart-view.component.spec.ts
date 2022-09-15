import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NonPremiumAtcChartViewComponent } from './non-premium-atc-chart-view.component';

describe('NonPremiumAtcChartViewComponent', () => {
  let component: NonPremiumAtcChartViewComponent;
  let fixture: ComponentFixture<NonPremiumAtcChartViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonPremiumAtcChartViewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NonPremiumAtcChartViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
