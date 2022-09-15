import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChangePasswordComponent } from '@app/components/change-password/change-password.component';
import { EVENTS } from '@app/constants/events-constants';
import { SessionModel } from '@app/models/auth/session';
import { ProfileProvider } from '@app/providers/apis/profile/profile';
import { AppService } from '@app/providers/service/app.service';
import { OfflineApiService } from '@app/providers/service/offline/offline-api.service';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { SessionService } from '@app/providers/service/session/session.service';
import { CreateClassroomComponent } from '@components/class/create-classroom/create-classroom.component';
import { IonInput } from '@ionic/angular';
import { ClassModel } from '@models/class/class';
import { StandardPreferenceModel } from '@models/preferences/preferences';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { ClassService } from '@providers/service/class/class.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { NetworkService } from '@providers/service/network.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { UtilsService } from '@providers/service/utils.service';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'teacher-home',
  templateUrl: './teacher-home.page.html',
  styleUrls: ['./teacher-home.page.scss'],
})
export class TeacherHomePage implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  @ViewChild(IonInput, { static: false }) public search: IonInput;
  public classList: Array<ClassModel>;
  public isShowSearchBar: boolean;
  public searchText: string;
  public isLoaded: boolean;
  public isNewUser: boolean;
  public preferences: StandardPreferenceModel;
  public tenantSetting: TenantSettingsModel;
  public isShowClassRooms: boolean;
  public archivedClass: Array<ClassModel>;
  public isShowInCompleteClassrooms: boolean;
  public isShowArchivedClass: boolean;
  public incompleteClasses: Array<ClassModel>;
  public isOnline: boolean;
  public hasInCompleteClassrooms: boolean;
  public networkSubscription: AnonymousSubscription;
  public userSession: SessionModel;
  public isEnableChangePassword: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private taxonomyService: TaxonomyService,
    private profileService: ProfileService,
    private classService: ClassService,
    private activatedRoute: ActivatedRoute,
    private lookupService: LookupService,
    private modalService: ModalService,
    private networkService: NetworkService,
    private utilsService: UtilsService,
    private zone: NgZone,
    private parseService: ParseService,
    private appService: AppService,
    private offlineApiService: OfflineApiService,
    private profileProvider: ProfileProvider,
    private sessionService: SessionService
  ) {
    this.userSession = this.sessionService.userSession;
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
      });
    });
    this.isShowClassRooms = true;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.isReload) {
        this.fetchClasses();
      }
      this.isNewUser = params.isNewUser;
    });
  }

  // -------------------------------------------------------------------------
  // Events
  public async ngOnInit() {
    if (this.isOnline) {
      const userDetailsData = await this.profileProvider.fetchUserProfile(this.userSession.user_id);
      this.isEnableChangePassword = userDetailsData[0].enableForcePasswordChange;
      if (this.isEnableChangePassword) {
        this.modalService.openModal(ChangePasswordComponent, {isChangedPassword: true}, 'change-password');
      }
    }
    await this.appService.initialize();
    this.fetchClasses();
    this.fetchProfilePreference();
    this.fetchCategories();
    this.fetchTenantSettings();
    this.trackAppOpenEvent();
  }

  public async ionViewDidEnter() {
    if (this.classList) {
      const classOfflineSettings = await this.offlineApiService.fetchOfflineClassesSettings();
      this.classList = this.updateClassesOfflineSettings(this.classList, classOfflineSettings);
    }
    this.appService.handleAppNotification();
  }

  public ngOnDestroy() {
    this.classService.classesSubject.next(null);
    this.networkSubscription.unsubscribe();
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant setting values
   */
  public fetchTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenant) => {
      this.tenantSetting = tenant;
    });
  }

  /**
   * @function onRefresh
   * This method is used to refresh the page
   */
  public onRefresh(event) {
    event.target.complete();
    this.fetchProfilePreference();
    this.fetchClasses();
  }

  /**
   * @function fetchClasses
   * method used to fetch class list
   */
  public fetchClasses() {
    this.isLoaded = false;
    Promise.all([this.classService.fetchClassList(),
    this.offlineApiService.fetchOfflineClassesSettings()]).then((result) => {
      const classList = result[0];
      const classesOfflineSettings = result[1];
      if (this.preferences?.class_sort_preference === 'alphabetical') {
        classList.sort((a, b) => {
          const classA = a.title.toLowerCase();
          const classB = b.title.toLowerCase();
          if (classA < classB)
            return -1;
          if (classA > classB)
            return 1;
          return 0;
        });
      } else {
        classList.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });
        classList.reverse();
      }
      const classes = classList.filter((archiveClass) => !archiveClass.isArchived);
      this.classList = this.updateClassesOfflineSettings(classes, classesOfflineSettings);
      this.archivedClass = classList.filter((archiveClass) => archiveClass.isArchived);
      this.incompleteClasses = this.classService.getIncompleteClasses(this.classList);
      this.hasInCompleteClassrooms = this.incompleteClasses.length && this.tenantSetting.showIncompleteClassrooms;
      this.isLoaded = true;
    });
  }

  /**
   * @function updateClassesOfflineSettings
   * Method to update the class offline settings
   */
  public updateClassesOfflineSettings(classes, classesOfflineSettings) {
    return classes.map((classDetails) => {
      const classOfflineSettings = classesOfflineSettings.find((item) => item.classId === classDetails.id);
      classDetails.isOfflineAccessEnabled = classOfflineSettings ? classOfflineSettings.settings.isOfflineAccessEnabled : false;
      return classDetails;
    })
  }

  /**
   * @function fetchCategories
   * Method to fetch categories
   */
  public fetchCategories() {
    this.taxonomyService.fetchCategories();
  }

  /**
   * @function fetchProfilePreference
   * Method to fetch profile preference
   */
  public fetchProfilePreference() {
    this.profileService.fetchProfilePreference().then((preferences: any) => {
      this.preferences = preferences;
    });
  }

  /**
   * @function toggleSearchBar
   * This method is used to search class name
   */
  public toggleSearchBar() {
    this.isShowSearchBar = !this.isShowSearchBar;
    this.searchText = '';
    if (this.isShowSearchBar) {
      setTimeout(() => { this.search.setFocus(); }, 150);
    }
  }

  /**
   * @function filterClassList
   * This method is used to filter by class name
   */
  public filterClassList(evt) {
    const searchTerm = evt.srcElement.value;
    this.searchText = searchTerm;
  }

  /**
   * @function openCreateClassroom
   * this Method is used to open create classroom page
   */
  public openCreateClassroom() {
    const context = {
      tenantSetting: this.tenantSetting
    };
    this.modalService.openModal(CreateClassroomComponent, context, 'create-classroom-container');
  }

  /**
   * @function onClickClassRoomTab
   * This method is used to display classrooms
   */
  public onClickClassRoomTab() {
    this.zone.run(() => {
      this.isShowClassRooms = true;
      this.isShowInCompleteClassrooms = false;
      this.isShowArchivedClass = false;
    });
    this.parseService.trackEvent(EVENTS.CLICK_CURRENTLY_TEACHING);
  }

  /**
   * @function onClickArchivedClassTab
   * This method is used to display archived classrooms
   */
  public onClickArchivedClassTab() {
    this.zone.run(() => {
      this.isShowClassRooms = false;
      this.isShowInCompleteClassrooms = false;
      this.isShowArchivedClass = true;
    });
    this.parseService.trackEvent(EVENTS.CLICK_ARCHIVED_CLASSROOMS);
  }

  /**
   * @function onInCompleteClassroomsTab
   * This method is used to display incomplete classrooms
   */
  public onInCompleteClassroomsTab() {
    this.zone.run(() => {
      this.isShowInCompleteClassrooms = true;
      this.isShowClassRooms = false;
      this.isShowArchivedClass = false;
    });
    this.parseService.trackEvent(EVENTS.CLICK_INCOMPLETE_SETUP);
  }

  /**
   * @function onDeleteClass
   * This method is used to delete incomplete class
   */
  public onDeleteClass(classId) {
    this.incompleteClasses = this.incompleteClasses.filter(classDetail => classDetail.id !== classId);
  }

  /**
   * @function trackAppOpenEvent
   * This method is used to track the app open event
   */
  private trackAppOpenEvent() {
    this.parseService.trackEvent(EVENTS.APP_OPEN);
  }
}
