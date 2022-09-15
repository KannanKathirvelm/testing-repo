import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DomainCoveragePanelComponent } from './domain-coverage-panel.component';

describe('DomainCoveragePanelComponent', () => {
  let component: DomainCoveragePanelComponent;
  let fixture: ComponentFixture<DomainCoveragePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DomainCoveragePanelComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DomainCoveragePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
