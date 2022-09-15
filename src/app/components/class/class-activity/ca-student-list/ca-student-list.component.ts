import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, NavParams } from '@ionic/angular';
import { CAStudentList } from '@models/class-activity/class-activity';
import { ClassMembersModel } from '@models/class/class';
import { TranslateService } from '@ngx-translate/core';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import axios from 'axios';

@Component({
  selector: 'app-ca-student-list',
  templateUrl: './ca-student-list.component.html',
  styleUrls: ['./ca-student-list.component.scss'],
})

export class CaStudentListComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @ViewChild(IonInput, { static: false }) public search: IonInput;
  public classId: string;
  public contentId: string;
  public studentList: Array<any>;
  public searchText: string;
  public selectedStudentList: Array<any>;
  public isStudentListLoaded: boolean;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private navParams: NavParams,
    private classService: ClassService,
    private classActivityService: ClassActivityService,
    private modalService: ModalService,
    private translate: TranslateService
  ) { }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    this.classId = this.navParams.get('classId');
    this.contentId = this.navParams.get('contentId');
    this.fetchStudentList();
  }

  // -------------------------------------------------------------------------
  // Methods

  public fetchStudentList() {
    this.isStudentListLoaded = false;
    return axios.all<{}>([
      this.classService.fetchClassMembersByClassId(this.classId),
      this.contentId ? this.classActivityService.fetchClassActivityUserList(this.classId, this.contentId) : []
    ]).then(axios.spread((classMembersResponse: ClassMembersModel, classActivityUsers: Array<CAStudentList> = []) => {
      const students = [];
      const classMembers = classMembersResponse['members'];
      classMembers.forEach((member) => {
        const memberId = member.id;
        const lastName = member.lastName;
        const firstName = member.firstName;
        const userClassActivity = this.contentId
          ? classActivityUsers.find((item) => item.id === memberId)
          : true;
        const student = {
          id: memberId,
          firstName,
          lastName,
          name: `${lastName}, ${firstName}`,
          avatarUrl: member.avatarUrl,
          isSelected: userClassActivity ? true : false,
          email: member.email,
          isActive: member.isActive,
          isShowLearnerData: member.isShowLearnerData
        };
        students.push(student);
      });
      const studentsList = students.filter((member) => member.isActive);
      this.studentList = studentsList;
      this.isStudentListLoaded = true;
    }));
  }

  /**
   * @function saveUsers
   * This method is used to save users
   */
  public saveUsers() {
    const studentList = this.studentList.filter((item) => item.isSelected);
    this.closeModal(studentList);
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
   * @function toggleStudentSelection
   * This method is used to toggle student selection
   */
  public toggleStudentSelection(student) {
    const selectedStudentIndex = this.studentList.indexOf(student);
    this.studentList[selectedStudentIndex].isSelected = !this.studentList[selectedStudentIndex].isSelected;
  }

  /**
   * @function selectedStudentListCount
   * This method is used to get selected student list count
   */
  get selectedStudentListCount() {
    if (this.studentList && this.studentList.length) {
      const studentListCount = this.studentList.length;
      const selectedStudentListCount = this.studentList.filter((item) => item.isSelected).length;
      return selectedStudentListCount === studentListCount
        ? 'All'
        : selectedStudentListCount > 0
          ? selectedStudentListCount
          : '';
    } else {
      return this.translate.instant('NONE');
    }
  }

  /**
   * @function deselect
   * This method is used to deselect
   */
  public deselect() {
    this.studentList = this.studentList.map((item) => {
      item.isSelected = false;
      return item;
    });
  }

  /**
   * @function selectall
   * This method is used to select all
   */
  public selectall() {
    this.studentList = this.studentList.map((item) => {
      item.isSelected = true;
      return item;
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
   * @function onImgError
   * This method is triggered when an image load error
   */
  public onImgError() {
    this.isThumbnailError = true;
  }
}
