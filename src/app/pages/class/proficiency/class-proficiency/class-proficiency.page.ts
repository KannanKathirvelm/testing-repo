import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NetworkService } from '@app/providers/service/network.service';
import { UtilsService } from '@app/providers/service/utils.service';
import { ClassMembersModel } from '@models/class/class';
import { DomainLevelSummaryModel, StudentDomainCompetenciesModel } from '@models/competency/competency';
import { ClassService } from '@providers/service/class/class.service';
import { CompetencyService } from '@providers/service/competency/competency.service';
import { ProficiencyService } from '@providers/service/proficiency/proficiency.service';
import { AnonymousSubscription } from 'rxjs/Subscription';
import axios from 'axios';
import moment from 'moment';
import { SyncService } from '@app/providers/service/sync.service';
import { WorkerService } from '@app/background-workers/services/worker.service';
import { DOWNLOAD_STATE, TASK_RESULT_STATUS } from '@app/constants/download-constants';
@Component({
  selector: 'class-proficiency',
  templateUrl: './class-proficiency.page.html',
  styleUrls: ['./class-proficiency.page.scss'],
})
export class ClassProficiencyPage implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  public isClassMembers: boolean;
  public isShowProficiencyView: boolean;
  public maxNumberOfCompetencies: number;
  public studentsDomainPerformance: Array<StudentDomainCompetenciesModel>;
  public searchText: string;
  public networkSubscription: AnonymousSubscription;
  public isOnline: boolean;
  public currentStudentIndex: number;
  public progressStatus: number;
  public syncContents: Array<string>;
  public downloadState: number;
  public showOfflineDownloadButton = true;
  public subjectCode: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private proficiencyService: ProficiencyService,
    private competencyService: CompetencyService,
    private classService: ClassService,
    private networkService: NetworkService,
    private syncService: SyncService,
    private workerService: WorkerService,
    private zone: NgZone,
    private utilsService: UtilsService
  ) {
    this.syncContents = [];
    this.currentStudentIndex = 0;
    this.progressStatus = 0;
    this.downloadState = DOWNLOAD_STATE.INTIAL;
  }

  public ngOnInit() {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
      });
    });
  }

  public ionViewDidEnter() {
    this.isClassMembers = true;
    this.isShowProficiencyView = true;
    this.loadData();
  }

  public ionViewDidLeave() {
    this.isShowProficiencyView = false;
    this.studentsDomainPerformance = [];
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadData
   * This method used to load the data
   */
  private loadData() {
    const classDetails = this.classService.class;
    this.subjectCode = classDetails.preference?.subject || null;
    const subjectCode = this.subjectCode;
    const classId = classDetails.id;
    const filters = {
      classId,
      courseId: classDetails.courseId,
      subjectCode
    };
    if (subjectCode) {
      return axios.all<{}>([
        this.competencyService.fetchDomainLevelSummary(filters),
        this.classService.fetchClassMembersByClassId(classId)
      ]).then(axios.spread((domainLevelSummary: DomainLevelSummaryModel, classmembers: ClassMembersModel) => {
        const classMembersModel = classmembers && classmembers.members ? classmembers.members : null;
        const members = classMembersModel.filter((member) => member.isActive);
        this.isClassMembers = members && Array.isArray(members) && !!members.length;
        this.isShowProficiencyView = this.isClassMembers && !!domainLevelSummary;
        if (this.isShowProficiencyView && this.isClassMembers) {
          const parsedStudentsDomainProficiencyData = this.proficiencyService.parseStudentsDomainProficiencyData(
            domainLevelSummary, members);
          this.maxNumberOfCompetencies = parsedStudentsDomainProficiencyData.maxNumberOfCompetencies;
          this.studentsDomainPerformance = parsedStudentsDomainProficiencyData.studentsDomainPerformance;
        }
        this.checkUserCompetencyMatrixIsCached(members[0]);
      }));
    }
  }

  /**
   * @function checkUserCompetencyMatrixIsCached
   * This method is used to check the user competency matrix is cached or not
   */
  public async checkUserCompetencyMatrixIsCached(member) {
    if (member?.id) {
      const subject = this.classService.class.preference.subject;
      const memberId = member.id;
      this.showOfflineDownloadButton = !!subject;
      if (subject) {
        const isCache = await this.syncService.checkUserCompetencyMatrixIsCached(subject, memberId);
        this.downloadState = isCache ? DOWNLOAD_STATE.DOWNLOADED : DOWNLOAD_STATE.INTIAL;
      }
    }
  }

  /**
   * @function downloadUserCompetencyMatrix
   * This method is used to download the user competency matrix
   */
  public downloadUserCompetencyMatrix() {
    const classId = this.classService.class.id;
    const subject = this.classService.class.preference.subject;
    this.showOfflineDownloadButton = !!subject;
    if (subject && this.studentsDomainPerformance.length) {
      const currentDate = moment();
      const month = currentDate.format('M');
      const year = currentDate.format('YYYY');
      const studentDataList = this.studentsDomainPerformance.map((studentDetails) => {
        const studentId = studentDetails.id;
        return ({
          studentId,
          subject,
          month,
          year,
          classId,
        })
      })
      this.syncUserCompetencyMatrix(studentDataList);
    }
  }

  /**
   * @function syncUserCompetencyMatrix
   * This method is used to sync user competency matrix data in the background task
   */
  private syncUserCompetencyMatrix(studentDataList) {
    this.downloadState = DOWNLOAD_STATE.IN_PROGRESS;
    if (this.syncContents.length === studentDataList.length) {
      this.downloadState = DOWNLOAD_STATE.DOWNLOADED;
    }
    const roundOffProgressStatus = this.syncContents.length / studentDataList.length * 100;
    this.progressStatus = Math.round(roundOffProgressStatus);
    if (this.currentStudentIndex < studentDataList.length) {
      const backgroundUserCompetencyTask = this.syncService.syncUserCompetencyMatrix(studentDataList[this.currentStudentIndex]);
      this.workerService.startTask(backgroundUserCompetencyTask).subscribe((result) => {
        const completedJob = result.currentCompletedJob;
        if (completedJob && result.taskStatus === TASK_RESULT_STATUS.RUNNING) {
          const currentJob = backgroundUserCompetencyTask.jobs.find((job) => job.id === completedJob.id);
          currentJob.callback(completedJob.result);
        } else if (result.taskStatus === TASK_RESULT_STATUS.TERMINATED) {
          this.syncContents.push(studentDataList[this.currentStudentIndex].studentId);
          this.currentStudentIndex++;
          this.syncUserCompetencyMatrix(studentDataList);
        }
      });
    }
  }

  /**
   * @function filterStudentList
   * This method is used to filter student list
   */
  public filterStudentList(event) {
    const searchTerm = event.srcElement.value;
    this.searchText = searchTerm;
  }
}
