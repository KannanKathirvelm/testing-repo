import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { YoutubePlayerFullscreenComponent } from './youtube-player-fullscreen.component';

describe('YoutubePlayerFullscreenComponent', () => {
  let component: YoutubePlayerFullscreenComponent;
  let fixture: ComponentFixture<YoutubePlayerFullscreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YoutubePlayerFullscreenComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(YoutubePlayerFullscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
