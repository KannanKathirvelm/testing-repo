import { Injectable } from '@angular/core';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import { environment } from '@environment/environment';
import { ProfileModel, StudentsClassesModel } from '@models/profile/profile';
import { HttpService } from '@providers/apis/http';
import { DatabaseService } from '@providers/service/database.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';

@Injectable({
  providedIn: 'root'
})

export class ProfileProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v2/profiles';
  private authNamespace = 'api/nucleus-auth/v2';
  private profileNamespace = 'api/nucleus-auth/v1';
  private namespaceProfile = 'api/nucleus/v1/profiles';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private sessionService: SessionService,
    private httpService: HttpService,
    private databaseService: DatabaseService,
    private utilsService: UtilsService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function verifyEmail
   * This method is used to verify email
   */
  public verifyEmail(email) {
    const endpoint = `${this.namespace}/search`;
    const params = {
      email
    };
    return this.httpService.get(endpoint, params).then((response) => {
      return this.normalizeReadProfile(response.data);
    });
  }

  /**
   * @function searchByFilter
   * This method is used to search users based on filter value
   */
  public searchByFilter(filters) {
    const endpoint = `${this.namespace}/search`;
    const params = {
      ...filters
    };
    return this.httpService.get(endpoint, params).then((response) => {
      return this.normalizeMultipleUserReadProfile(response.data.users);
    });
  }

  /**
   * @function fetchUserProfile
   * This method is used to get user profile
   */
  public fetchUserProfile(users) {
    const endpoint = `${this.namespace}/search`;
    const userids = Array.isArray(users) ? users.join() : users;
    const params = {
      userids
    };
    return this.httpService.get<Array<ProfileModel>>(endpoint, params).then((res) => {
      return this.normalizeMultipleUserReadProfile(res.data.users);
    });
  }

  /**
   * @function fetchProfilePreference
   * This method is profile preferences
   */
  public fetchProfilePreference() {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespace}/preference`;
        this.httpService.get<any>(endpoint).then((res) => {
          const profileData = res.data;
          this.databaseService.upsertDocument(DOCUMENT_KEYS.PROFILE_PREFERENCE, profileData);
          resolve(profileData);
        }, reject);
      } else {
        this.databaseService.getDocument(DOCUMENT_KEYS.PROFILE_PREFERENCE).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function deleteProfile
   * This method is to delete user profile
   */
   public deleteProfile() {
    const endpoint = `${this.namespace}?appId=${environment.TRANSLATION_APP_ID}`;
    return this.httpService.delete<string>(endpoint);
  }

  /**
   * @function normalizeMultipleUserReadProfile
   * This Method is used to normalize multiple profile
   */
  private normalizeMultipleUserReadProfile(users) {
    return users.map((payload) => {
      return this.normalizeReadProfile(payload);
    });
  }

  /**
   * @function normalizeReadProfile
   * This Method is used to normalize profile
   */
  public normalizeReadProfile(payload) {
    const basePath = this.sessionService.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : null;
    const isShowData = !(
      payload.show_proficiency === false &&
      payload.show_score === false &&
      payload.show_timespent === false
    );
    const userProfile = {
      id: payload.id,
      firstName: payload.first_name,
      lastName: payload.last_name,
      username: payload.username,
      email: payload.email,
      gender: payload.gender,
      grades: payload.grade,
      dateOfBirth: payload.birth_date,
      role: payload.user_category,
      createdAt: payload.created_at,
      lastUpdate: payload.updated_at,
      countryId: payload.country_id,
      country: payload.country,
      stateId: payload.state_id,
      state: payload.state,
      studentId: payload.roster_global_userid,
      schoolDistrictId: payload.school_district_id,
      schoolDistrict: payload.school_district,
      schoolId: payload.school_id || null,
      about: payload.about,
      avatarUrl: thumbnailUrl,
      rosterId: payload.roster_id,
      referenceId: payload.reference_id || null,
      followers: payload.followers,
      followings: payload.followings,
      isFollowing: !!payload.isFollowing,
      fullName: `${payload.last_name} ${payload.first_name}`,
      isActive: payload.is_active || false,
      profileBaselineDone: payload.profile_baseline_done,
      loginType: payload.login_type,
      diagAsmtState: payload.diag_asmt_state,
      isSelected: false,
      deletionTriggerDate: payload.deletion_trigger_date,
      isShowLearnerData: isShowData,
      showEmail: payload.show_email,
      enableForcePasswordChange: payload.enable_force_password_change
    };
    return userProfile;
  }

  /**
   * @function verifyUserEmail
   * This method is used to verify user email id
   */
  public verifyUserEmail(emailId: string, token: string) {
    const endpoint = `${this.authNamespace}/users/send-email-verify`;
    const params = {
      email: emailId
    };
    const headers = this.httpService.getTokenHeaders(token);
    const reqOpts = { headers };
    return this.httpService.post<string>(endpoint, params, reqOpts);
  }

  /**
   * @function updateEmailVerification
   * This Method is used to update the email verification
   */
  public updateEmailVerification(token: string) {
    const endpoint = `${this.profileNamespace}/users/email-verify`;
    const params = { token };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function getStudentAvailability
   * method to fetch users list
   */
  public fetchUsersList(params) {
    const endpoint = `${this.namespaceProfile}/users/details`;
    return this.httpService.post(endpoint, params).then(response => {
      return this.normalizeUsersList(response.data);
    })
  }

  /**
   * @function normalizeUsersList
   * method to normalize users list
   */
  public normalizeUsersList(payload): Array<StudentsClassesModel> {
    const users = payload.users ? payload.users : {};
    const usersDetails: any = Object.values(users);
    const userKeys = Object.keys(users);
    return usersDetails.map((user, index) => {
      let studentsClass: StudentsClassesModel = { status: false, email: userKeys[index] } as StudentsClassesModel;
      if (user) {
        studentsClass = {
          createdAt: user.created_at,
          email: user.email,
          firstName: user.first_name,
          id: user.id,
          isDeleted: user.is_deleted,
          isEmailVerified: user.is_email_verified,
          lastName: user.last_name,
          thumbnail: user.thumbnail,
          updatedAt: user.updated_at,
          userCategory: user.user_category,
          username: user.username,
          status: true
        }
      }
      return studentsClass;
    })
  }
}
