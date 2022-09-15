import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchByFilterSubjectPanelComponent } from './search-by-filter-subject-panel.component';

describe('SearchByFilterSubjectPanelComponent', () => {
  let component: SearchByFilterSubjectPanelComponent;
  let fixture: ComponentFixture<SearchByFilterSubjectPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchByFilterSubjectPanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchByFilterSubjectPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
