import { Component, OnInit } from '@angular/core';
import { SessionModel } from '@models/auth/session';
import { AuthService } from '@providers/service/auth/auth.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { SessionService } from '@providers/service/session/session.service';

@Component({
  selector: 'about-me',
  templateUrl: './about-me.page.html',
  styleUrls: ['./about-me.page.scss'],
})
export class AboutMePage implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  public maxChars: number;
  public about: string;
  public isUpdate: boolean;
  public isEdit: boolean;
  public isContentAvailable: boolean;
  public userSession: SessionModel;
  public isLoaded: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileService: ProfileService,
    private sessionService: SessionService,
    private authService: AuthService,
  ) {
    this.maxChars = 500;
    this.isUpdate = false;
    this.userSession = this.sessionService.userSession;
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.isLoaded = false;
    this.profileService.fetchUserProfile(this.userSession.user_id).then((response) => {
      const profile = response.length ? response[0] : null;
      if (profile) {
        this.about = profile.about;
        this.isEdit = profile.about && profile.about.length;
        this.isContentAvailable = !this.isEdit;
        this.isLoaded = true;
      }
    });
  }

  /**
   * @function onClickUpdate
   * This method is used to change the condition based on data
   */
  public onClickUpdate() {
    this.isUpdate = true;
    this.isEdit = false;
    this.isContentAvailable = false;
  }

  /**
   * @function onSubmit
   * This method is used to submit the about details
   */
  public onSubmit() {
    const postData = {
      about: this.about
    };
    this.authService.updateUserProfile(postData)
      .then(() => {
        this.isUpdate = false;
        this.isEdit = this.about && this.about.length ? true : false;
        this.isContentAvailable = !this.isEdit;
      });
  }
}
