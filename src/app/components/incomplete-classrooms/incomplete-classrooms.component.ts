import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClassModel, RosterGradeSubjectModel } from '@app/models/class/class';
import { ClassService } from '@app/providers/service/class/class.service';

@Component({
  selector: 'nav-incomplete-classrooms',
  templateUrl: './incomplete-classrooms.component.html',
  styleUrls: ['./incomplete-classrooms.component.scss'],
})
export class IncompleteClassroomsComponent implements OnInit {

  @Input() public incompleteClass: ClassModel;
  @Input() public isOnline: boolean;
  public subjectList: Array<RosterGradeSubjectModel> = [];
  public selectedGrade: RosterGradeSubjectModel;
  public isConfirmDelete: boolean;
  public isConfirmUpdate: boolean;
  @Output() public deleteClassRoom = new EventEmitter();

  constructor(
    private classService: ClassService
  ) { }

  public ngOnInit() {
    const rosterGrade = this.incompleteClass.rosterGrade || null;
    if (rosterGrade) {
      this.subjectList = rosterGrade.subjects;
    }
  }

  /**
   * @function deleteClass
   * Method is used to delete class
   */
  public deleteClass() {
    this.isConfirmDelete = !this.isConfirmDelete;
    this.selectedGrade = null;
    this.isConfirmUpdate = false;
  }

  /**
   * @function onConfirm
   * Method is used to confirm the class
   */
  public onConfirm() {
    if (this.isConfirmDelete) {
      this.deleteClassRooms();
    } else {
      this.updateClassPreference();
    }
  }

  /**
   * @function onSelectGrade
   * Help to select and update the grade
   */
  public onSelectGrade(rosterGrade) {
    const isChecked = this.selectedGrade ? this.selectedGrade.gradeId === rosterGrade.gradeId : false;
    this.selectedGrade = !isChecked ? rosterGrade : null;
    this.isConfirmUpdate = !isChecked;
    this.isConfirmDelete = false;
  }

  /**
   * @function updateClassPreference
   * Help to update the class preference to complete the class setup
   */
  public updateClassPreference() {
    const classData = this.incompleteClass;
    const selectedGrade = this.selectedGrade;
    const classId = classData.id;
    const classSetup = [];
    const params = {
      grade_id: selectedGrade.gradeId,
      fw: selectedGrade.fwCode,
      subject: selectedGrade.code,
      class_id: classId
    }
    classSetup.push(params);
    const requestPayload = {
      data: classSetup
    }
    this.classService.setupIncompletedClass(requestPayload).then(() => {
      this.incompleteClass.preference = {
        subject: params.subject,
        framework: params.fw
      }
      this.isConfirmUpdate = false;
      this.deleteClassRoom.emit(classId);
    });
  }

  /**
   * @function deleteClassRooms
   * Help to delete the incompleted class rooms.
   */
  public deleteClassRooms() {
    const classData = this.incompleteClass;
    const classId = classData.id;
    this.classService.deleteClassRoom(classId).then(() => {
      this.isConfirmDelete = false;
      this.deleteClassRoom.emit(classId);
    })
  }
}
