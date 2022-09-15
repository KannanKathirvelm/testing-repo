import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { SessionModel } from '@app/models/auth/session';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { AddClassMembersComponent } from '@components/class/class-settings/add-class-members/add-class-members.component';
import { AlertController } from '@ionic/angular';
import { ClassModel } from '@models/class/class';
import { ProfileModel, StudentsClassesModel } from '@models/profile/profile';
import { TaxonomyGrades } from '@models/taxonomy/taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';


@Component({
  selector: 'student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss'],
})
export class StudentListComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public classMembers: Array<ProfileModel>;
  @Input() public classDetails: ClassModel;
  @Input() public isPremiumClass: boolean;
  @Input() public tenantSettingShowInfo: string;
  @Input() public sourceGrades: Array<TaxonomyGrades>;
  @Input() public destinationGrades: Array<TaxonomyGrades>;
  @Output() public studentStatus = new EventEmitter();
  @Output() public mathLevelChange = new EventEmitter();
  @Output() public destinationChange = new EventEmitter();
  @Output() public toggleStudentList = new EventEmitter();
  @Output() public addNewStudent = new EventEmitter();
  @Output() public deletedStudent = new EventEmitter();
  @Input() public classOwner: ProfileModel;
  @Input() public userSession: SessionModel;
  @Input() public hasShowGradeLevel: boolean;
  public isThumbnailError: boolean;
  public searchStudentName: string;
  public sourceSelectHeader: { header: string };
  public destinationSelectHeader: { header: string };
  public searchTitle: string;
  public destinationTitle: string;
  public searchText: string;
  public multiSearchUsers: Array<StudentsClassesModel> = [];
  public isShowAddStudent: boolean;
  public isShowMultiMailBox: boolean;
  public isShowDeleteStudent: boolean;
  public classMemberId: string;
  public studentFullName: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    public alertController: AlertController,
    private translate: TranslateService,
    private modalService: ModalService,
    private parseService: ParseService
  ) {
    this.sourceSelectHeader = {
      header: this.translate.instant('SOURCE')
    };
    this.destinationSelectHeader = {
      header: this.translate.instant('DESTINATION')
    };
    this.searchTitle = this.translate.instant('SOURCE');
    this.destinationTitle = this.translate.instant('DESTINATION');
  }

  // -------------------------------------------------------------------------
  // methods

  /**
   * @function onDeleteStudent
   * This Method is used to delete a student
   */
  public async onDeleteStudent(classMemberId, classMember) {
    this.classMemberId = classMemberId;
    this.studentFullName = `${classMember.lastName}, ${classMember.firstName}`;
    const context = this.getEventContext();
    this.parseService.trackEvent(EVENTS.CLICK_CLASS_SETTINGS_DELETE_STUDENT, context);
    this.isShowDeleteStudent = true;
  }

  /**
   * @function closeDeleteClassPopup
   * This Method is used to close delete popup
   */
  public closeDeleteClassPopup() {
    this.isShowDeleteStudent = false;
  }

  /**
   * @function onConfirmDeleteStudentClassRoom
   * Method is to delete the student on the classroom
   */
  public onConfirmDeleteStudentClassRoom() {
    this.onConfirmDeleteStudent(this.classMemberId);
    this.closeDeleteClassPopup();
  }

  /**
   * @function onConfirmDeleteStudent
   * This Method is used to confirm delete a student
   */
  public onConfirmDeleteStudent(classMemberId) {
    this.classService.deleteClassMember(this.classDetails.id, classMemberId).then(() => {
      this.deletedStudent.emit();
    });
  }

  /**
   * @function toggleActivateStudent
   * This Method is used to activate a student
   */
  public toggleActivateStudent(event, classMemberId) {
    const toggleValue = event.detail.checked;
    this.studentStatus.emit({
      studentId: classMemberId,
      status: toggleValue
    });
    this.parseService.trackEvent(EVENTS.CLICK_CS_STUDENT_ACTIVATE);
  }

  /**
   * @function onLowerBoundChange
   * This Method is used to update the changes made in math level (source)
   */
  public onLowerBoundChange(event) {
    const studentId = event.studentId;
    const gradeLevel = event.gradeLevelId;
    const lowerBound = event.lowerBoundId;
    this.mathLevelChange.emit({
      studentId,
      lowerBound,
      gradeLevel
    });
  }

  /**
   * @function onUpperBoundChange
   * This Method is used to update the changes made in destination level (destination)
   */
  public onUpperBoundChange(event) {
    const studentId = event.studentId;
    const upperBound = event.gradeBound;
    this.destinationChange.emit({
      studentId,
      upperBound
    });
  }

  /**
   * @function onAddStudent
   * This Method is used to add student
   */
  public onAddStudent() {
    this.isShowAddStudent = true;
    this.openAddMemberPullUp();
  }

  /**
   * @function onAddMultipleStudent
   * This Method is used to add multiple student
   */
  public onAddMultipleStudent() {
    this.isShowMultiMailBox = true;
    this.openAddMemberPullUp(true);
  }

  /**
   * @function openAddMemberPullUp
   * This Method is used to open the add member pull up
   */
   public openAddMemberPullUp(isMultipleStudentAdd = false) {
    const context = this.getEventContext();
    this.parseService.trackEvent(EVENTS.CLICK_CLASS_SETTINGS_ADD_STUDENT, context);
    const param = {
      classMembers: this.classMembers,
      tenantSettingShowInfo: this.tenantSettingShowInfo,
      classDetails: this.classDetails,
      userTenant:  this.userSession.tenant,
      teacherName: this.classOwner.fullName,
      isMultipleStudentAdd
    };
    this.modalService.openModal(AddClassMembersComponent, param, 'add-class-members').then((addNewStudent) => {
      this.isShowAddStudent = false;
      this.isShowMultiMailBox = false;
      this.addNewStudent.emit();
      this.toggleStudentList.emit();
    });
  }

  /**
   * @function filterStudentList
   * This method is used to filter student list
   */
  public filterStudentList(event) {
    const searchTerm = event.srcElement.value;
    this.searchText = searchTerm;
  }

  /**
   * @function onToggleMultiMailBox
   * This method helps to toggle the mail text box
   */
  public onToggleMultiMailBox(){
    this.isShowMultiMailBox = !this.isShowMultiMailBox
  }

  /**
   * @function getEventContext
   * This method is used to get the context for add student event
   */
  public getEventContext() {
    return {
      classId: this.classDetails.id,
      className: this.classDetails.title,
      courseId: this.classDetails.courseId
    };
  }

  /**
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}