import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DefaultScopeAndSequenceComponent } from './default-scope-and-sequence.component';

describe('DefaultScopeAndSequenceComponent', () => {
  let component: DefaultScopeAndSequenceComponent;
  let fixture: ComponentFixture<DefaultScopeAndSequenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultScopeAndSequenceComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DefaultScopeAndSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
