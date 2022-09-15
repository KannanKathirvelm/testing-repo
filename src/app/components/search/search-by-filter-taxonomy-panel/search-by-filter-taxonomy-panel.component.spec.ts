import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchByFilterTaxonomyPanelComponent } from './search-by-filter-taxonomy-panel.component';

describe('SearchByFilterTaxonomyPanelComponent', () => {
  let component: SearchByFilterTaxonomyPanelComponent;
  let fixture: ComponentFixture<SearchByFilterTaxonomyPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchByFilterTaxonomyPanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchByFilterTaxonomyPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
