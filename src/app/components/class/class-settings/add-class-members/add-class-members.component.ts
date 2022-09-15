import { Component, OnInit } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { EMAIL_TEMPLATE_NAME } from '@app/constants/helper-constants';
import { TenantModel } from '@app/models/auth/tenant';
import { ClassModel, MailClassesModel } from '@app/models/class/class';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { environment } from '@environment/environment';
import { ProfileModel, StudentsClassesModel } from '@models/profile/profile';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { LoadingService } from '@providers/service/loader.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { ProfileService } from '@providers/service/profile/profile.service';
import { UtilsService } from '@providers/service/utils.service';

@Component({
  selector: 'nav-add-class-members',
  templateUrl: './add-class-members.component.html',
  styleUrls: ['./add-class-members.component.scss']
})
export class AddClassMembersComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public tenantSettingShowInfo: string;
  public searchStudentName: string;
  public searchFilter: string;
  public studentList: Array<ProfileModel>;
  public isSearchLoaded: boolean;
  public isThumbnailError: boolean;
  public selectedStudentIds: Array<string>;
  public classId: string;
  public searchByHeader: { header: string };
  public classMembers: Array<ProfileModel>;
  public classDetails: ClassModel;
  public userTenant: TenantModel;
  public multiSearchUsers: Array<StudentsClassesModel> = [];
  public userMailIds: string;
  public teacherName: string;
  public isMultipleStudentAdd: boolean;

  public get tenantSignUpUrl() {
    const signUpurl = environment.TENANT_SIGNUP_URL;
    const tenantName = this.userTenant.tenant_short_name || this.userTenant.tenant_name || '';
    return signUpurl + tenantName + '?r=s';
  }

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileService: ProfileService,
    private classService: ClassService,
    private modalService: ModalService,
    private loadingService: LoadingService,
    private translate: TranslateService,
    private utilsService: UtilsService,
    private parseService: ParseService
  ) {
    const classDetails = this.classService.class;
    this.classId = classDetails.id;
    this.selectedStudentIds = [];
    this.searchFilter = 'email';
    this.searchByHeader = {
      header: this.translate.instant('SEARCH_BY')
    };
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit(): void {
    if (this.isMultipleStudentAdd) {
      this.utilsService.addClassForModals('add-class-members', 'multiple-student');
    }
    this.parseService.trackEvent(EVENTS.CLICK_CS_SEARCH_BY);
  }

  /**
   * @function onUserSearch
   * This Method is used search and get list of users (search result)
   */
  public onUserSearch() {
    this.loadingService.displayLoader();
    const filter = { partial: true };
    if (this.searchFilter === 'email') {
      Object.assign(filter, { email: this.searchStudentName });
    } else {
      Object.assign(filter, { username: this.searchStudentName });
    }
    this.profileService.searchByFilter(filter).then((studentListResponse) => {
      const classMembersIds = this.classMembers.map(classMember => classMember.id);
      this.studentList = studentListResponse.filter((item) => {
        return !classMembersIds.includes(item.id);
      });
    }).catch((error) => {
      if (error.response.status === 404) {
        this.studentList = [];
      }
    }).finally(() => {
      this.isSearchLoaded = true;
      this.loadingService.dismissLoader();
      this.utilsService.addClassForModals('add-class-members', 'search-loaded');
    });
  }

  /**
   * @function closeModal
   * This method is used to close modal
   */
  public closeModal(context?) {
    this.modalService.dismissModal(context);
  }

  /**
   * @function addStudent
   * This method is used to add student
   */
  public addStudent(student) {
    const selectedStudentIndex = this.studentList.indexOf(student);
    this.studentList[selectedStudentIndex].isSelected = !this.studentList[selectedStudentIndex].isSelected;
    this.selectedStudentIds = this.studentList
      .filter((item) => item.isSelected)
      .map((item) => item.id);
  }

  /**
   * @function addStudentsToClass
   * This method is used to add student to class
   */
  public addStudentsToClass() {
    if (this.selectedStudentIds.length) {
      this.classService.addStudentsToClass(this.classId, this.selectedStudentIds).then((response) => {
        this.closeModal(response);
      });
    }
  }

  /**
   * @function changeSearchType
   * This method is used to change search type
   */
  public changeSearchType(event) {
    this.searchFilter = event.target.value;
    this.parseService.trackEvent(EVENTS.CLICK_CS_SEARCH_BY);
  }

  /**
   * @function onSearchUsersByMailId
   * This method is used to search user mail id
   */
  public onSearchUsersByMailId() {
    const userMailIds = this.userMailIds;
    if (userMailIds) {
      const params = {
        user_category: 'student',
      }
      if (this.searchFilter === 'email') {
        const emails = userMailIds.split(',').filter(email => email)
        Object.assign(params, { email_ids: emails });
      } else {
        const usernames = userMailIds.split(',').filter(username => username)
        Object.assign(params, { usernames });
      }
      this.loadingService.displayLoader();
      this.profileService.fetchUsersList(params).then(usersList => {
        this.multiSearchUsers = usersList;
        this.loadingService.dismissLoader();
        this.utilsService.addClassForModals('add-class-members', 'search-loaded');
      })
    }
  }

  /**
   * @function onClickStudentSignUp
   * This Method is used to navigate to the sign up page
   */
  public onClickStudentSignUp() {
    this.utilsService.openMeetingLink(this.tenantSignUpUrl);
  }

  /**
   * @function onClear
   * This method is used to reset
   */
  public onClear() {
    this.multiSearchUsers = [];
    this.userMailIds = null;
    this.utilsService.addClassForModals('add-class-members', 'search-loaded', true);
  }

  /**
   * @function addStudentToClass
   * This method is used to add student
   */
   public async addStudentToClass() {
    const classDetails = this.classDetails;
    if (environment.SEND_SIGNUP_MAIL_INVITE) {
     await this.sendMail();
    }
    const studentIds = this.multiSearchUsers.filter(user => user.status).map(user => user.id);
    if (studentIds.length) {
     await this.classService.addStudentsToClass(classDetails.id, studentIds).then((response) => {
        this.userMailIds = null;
        this.multiSearchUsers = [];
        this.closeModal(response);
      });
    }
  }

  /**
   * @function sendMail
   * This method is used to send the mail
   */
  public async sendMail() {
    const classDetails = this.classDetails;
    const params: MailClassesModel = {
      mail_template_name: EMAIL_TEMPLATE_NAME.SIGNUP_MAIL,
      to_addresses: this.multiSearchUsers.filter(user => !user.status).map(user => user.email),
      mail_template_context: {
        teacher_name: this.teacherName,
        class_name: classDetails.title,
        class_code: classDetails.code,
        signup_url: this.tenantSignUpUrl
      }
    }
    return this.classService.sendWelcomeMail(params);
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
