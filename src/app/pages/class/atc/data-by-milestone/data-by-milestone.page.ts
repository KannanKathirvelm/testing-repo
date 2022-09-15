import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathIdReplace } from '@constants/router-constants';
import { IonSelect } from '@ionic/angular';
import { ClassModel } from '@models/class/class';
import { MilestoneByDateModel } from '@models/milestone/milestone';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { MilestoneService } from '@providers/service/milestone/milestone.service';

@Component({
  selector: 'app-data-by-milestone',
  templateUrl: './data-by-milestone.page.html',
  styleUrls: ['./data-by-milestone.page.scss'],
})
export class DataByMilestonePage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @ViewChild('milestoneSelect') public selectRef: IonSelect;
  public classDetails: ClassModel;
  public milestones: Array<MilestoneByDateModel>;
  public selectedMilestone: MilestoneByDateModel;
  public searchText: string;
  public milestoneSelectHeader: { header: string };

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private milestoneService: MilestoneService,
    private classService: ClassService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.milestoneSelectHeader = {
      header: this.translate.instant('MILESTONES')
    }
  }

  // -------------------------------------------------------------------------
  // Life Cycle methods

  public ngOnInit() {
    this.classDetails = this.classService.class;
    this.fetchMilestones();
  }

  // -------------------------------------------------------------------------
  // Methods

  public fetchMilestones() {
    this.milestoneService.fetchMilestoneByDate(this.classDetails.id).then((response) => {
      this.milestones = this.concatAllMilestoneStudents(response);
      this.setSelectedMilestone(response[0].gradeId);
    });
  }

  public concatAllMilestoneStudents(milestoneList) {
    const milestone = {
      domainCount: 0,
      topicCount: 0,
      competencyCount: 0,
      students: [],
      gradeId: 0,
      gradeName: '',
      gradeSeq: 0,
      milestoneId: '',
      milestoneSeq: 0,
      title: this.translate.instant('ALL_MILESTONES')
    };
    milestoneList.forEach((item) => {
      item.title = `${this.translate.instant('MILESTONE')} ${item.milestoneSeq} - ${item.gradeName}`;
      milestone.domainCount += item.domainCount;
      milestone.topicCount += item.topicCount;
      milestone.competencyCount += item.competencyCount;
      item.students.forEach(student => {
        const existingStudent = milestone.students.find((element) => element.id === student.id);
        if (existingStudent) {
          existingStudent.averageScore = Number(
            (existingStudent.averageScore + student.averageScore) / 2
          );
          existingStudent.totalCompetencies = parseInt(
            existingStudent.totalCompetencies + student.totalCompetencies,
            0
          );
          existingStudent.completedCompetencies = parseInt(
            existingStudent.completedCompetencies +
            student.completedCompetencies,
            0
          );
        } else {
          milestone.students.push(student);
        }
      });
    });
    milestoneList.push(milestone);
    return milestoneList;
  }

  public setSelectedMilestone(gradeId) {
    this.selectedMilestone = this.milestones.find((item) => item.gradeId === gradeId);
  }

  public onSelectMilestone(event) {
    const gradeId = event.detail.value;
    this.setSelectedMilestone(gradeId);
  }

  public openMilestoneList() {
    this.selectRef.open();
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
   * @function navigateToAtcPage
   * This method is used to navigate to atc page
   */
  public navigateToAtcPage() {
    const atcURL = routerPathIdReplace('atc', this.classDetails.id);
    this.router.navigate([atcURL]);
  }

  /**
   * @function navigateToMilestone
   * This method is used to navigate to milestone page
   */
  public navigateToMilestone(studentId) {
    const milestoneURL = routerPathIdReplace('journey', this.classDetails.id);
    this.router.navigate([milestoneURL], { queryParams: { studentId } });
  }
}
