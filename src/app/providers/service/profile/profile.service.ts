import { Injectable } from '@angular/core';
import { ProfileProvider } from '@providers/apis/profile/profile';
import { cloneObject } from '@utils/global';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  // -------------------------------------------------------------------------
  // Properties

  private preferencesSubject: BehaviorSubject<Array<string>>;
  private userProfileUpdateSubject: BehaviorSubject<boolean>;
  public userProfileUpdate: Observable<boolean>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileProvider: ProfileProvider
  ) {
    this.preferencesSubject = new BehaviorSubject<Array<string>>(null);
    this.userProfileUpdateSubject = new BehaviorSubject<boolean>(false);
    this.userProfileUpdate = this.userProfileUpdateSubject.asObservable();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchProfilePreference
   * This method is used to fetch profile preference.
   */
  public fetchProfilePreference() {
    return this.profileProvider.fetchProfilePreference().then((preference: any) => {
      this.preferencesSubject.next(preference);
      return preference;
    });
  }

  /**
   * @function updateUserProfileEvent
   * This method is used to update profile.
   */
  public updateUserProfileEvent(isUpdated) {
    this.userProfileUpdateSubject.next(isUpdated);
  }

  /**
   * @function fetchUserProfile
   * This method is used to fetch profile preference.
   */
  public fetchUserProfile(userId) {
    return this.profileProvider.fetchUserProfile(userId);
  }

  /**
   * @function deleteProfile
   * This method is to delete user profile
   */
  public deleteProfile() {
    return this.profileProvider.deleteProfile();
  }

  get profilePreferences() {
    return this.preferencesSubject ? cloneObject(this.preferencesSubject.value) : null;
  }

  /**
   * @function searchByFilter
   * This method is used to search by filters.
   */
  public searchByFilter(filters) {
    return this.profileProvider.searchByFilter(filters).then((studentList) => {
      return studentList.sort((student1, student2) =>
        (student2.firstName - student1.firstName)
      );
    });
  }

  /**
   * @function updateCollaborators
   * This method is used to update collaborators.
   */
  public updateCollaborators(emailId) {
    return this.profileProvider.verifyEmail(emailId);
  }

  /**
   * @function verifyUserEmail
   * This method is used to verify email.
   */
  public verifyUserEmail(emailId, token) {
    return this.profileProvider.verifyUserEmail(emailId, token);
  }

  /**
   * @function updateEmailVerification
   * this method used to verify email
   */
  public updateEmailVerification(token) {
    return this.profileProvider.updateEmailVerification(token);
  }

  /**
   * @function fetchUsersList
   * Method to fetch user list
   */
  public fetchUsersList(params) {
    return this.profileProvider.fetchUsersList(params);
  }
}
