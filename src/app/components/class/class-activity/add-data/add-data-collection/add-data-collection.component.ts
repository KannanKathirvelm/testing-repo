import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '@app/providers/service/toast.service';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from '@constants/helper-constants';
import { NavParams } from '@ionic/angular';
import { CAStudentList, CAStudentPerformance } from '@models/class-activity/class-activity';
import { ClassModel } from '@models/class/class';
import { CollectionQuestionAddDataModel } from '@models/collection/collection';
import { TranslateService } from '@ngx-translate/core';
import { ClassActivityService } from '@providers/service/class-activity/class-activity.service';
import { ClassService } from '@providers/service/class/class.service';
import { CollectionService } from '@providers/service/collection/collection.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { PerformanceService } from '@providers/service/performance/performance.service';
import { SessionService } from '@providers/service/session/session.service';
import { NetworkService } from '@providers/service/network.service';
import { UtilsService } from '@providers/service/utils.service';
import { generateUUID } from '@utils/global';
import * as moment from 'moment';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { SYNC_EVENTS } from '@app/constants/events-constants';

@Component({
  selector: 'nav-add-data-collection',
  templateUrl: './add-data-collection.component.html',
  styleUrls: ['./add-data-collection.component.scss'],
})
export class AddDataCollectionComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  public activationDate: string;
  public classId: string;
  public contentId: string;
  public contentType: string;
  public thumbnail: string;
  public activityId: string;
  public title: string;
  public searchText: string;
  public questions: Array<CollectionQuestionAddDataModel>;
  public isTimespentAdded: boolean;
  public students: Array<CAStudentList>;
  public class: ClassModel;
  public isCollection: boolean;
  public externalHours: number;
  public externalMinutes: number;
  public performance: Array<CAStudentPerformance>;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private navParams: NavParams,
    private collectionService: CollectionService,
    private classActivityService: ClassActivityService,
    private sessionService: SessionService,
    private classService: ClassService,
    private performanceService: PerformanceService,
    private networkService: NetworkService,
    private utilsService: UtilsService,
    private zone: NgZone,
    private toastService: ToastService,
    private translate: TranslateService
  ) {
  }

  // -------------------------------------------------------------------------
  // Life cycle methods

  public ngOnInit() {
    this.initialize();
    if (this.isCollection) {
      this.fetchCollections();
    }
    this.fetchStudentListForAddData();
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }

  /**
   * @function initialize
   * This method is used to initialize data
   */
  public initialize() {
    const todayDate = moment().format('YYYY-MM-DD');
    const activationDate = this.navParams.get('activationDate');
    this.activationDate = activationDate ? activationDate : todayDate;
    this.classId = this.navParams.get('classId');
    this.contentId = this.navParams.get('contentId');
    this.contentType = this.navParams.get('contentType');
    this.thumbnail = this.navParams.get('thumbnail');
    this.activityId = this.navParams.get('activityId');
    this.performance = this.navParams.get('performance');
    this.searchText = '';
    this.isTimespentAdded = false;
    this.class = this.classService.class;
    this.isCollection = this.contentType === CONTENT_TYPES.COLLECTION;
    this.externalHours = 0;
    this.externalMinutes = 0;
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
      });
    });
  }

  /**
   * @function setTimespent
   * This method is used to set time spent
   */
  public setTimespent(event, index) {
    const currentQuestion = this.questions[index];
    const milliseconds = event.hoursIntoMilliseconds + event.minutesIntoMilliseconds;
    this.isTimespentAdded = milliseconds > 1;
    currentQuestion.isExpanded = false;
    currentQuestion.timespent = milliseconds;
    currentQuestion.hours = event.hours;
    currentQuestion.minutes = event.minutes;
    const nextQuestion = index + 1;
    if (nextQuestion < this.questions.length) {
      // setTimeout used to avoid transition animation delay
      setTimeout(() => {
        this.questions[nextQuestion].isExpanded = true;
      }, 500);
    }
  }

  /**
   * @function openedContent
   * This method is trigger when open content and set isExpanded true
   */
  public openedContent(content) {
    content.isExpanded = true;
  }

  /**
   * @function submitExternalCollectionTimeSpent
   * This method is used to set external collection timespent
   */
  public submitExternalCollectionTimeSpent(event) {
    const externalCollectionParams = this.getExternalCollectionDataParams(event.hoursIntoMilliseconds, event.minutesIntoMilliseconds);
    this.saveStudentCollectionPerformanceData(externalCollectionParams);
  }

  /**
   * @function closeReport
   * This method is used to close report
   */
  public closeReport() {
    this.modalService.dismissModal();
  }

  /**
   * @function fetchCollections
   * This method is used to fetch collection by id
   */
  public fetchCollections() {
    this.collectionService.fetchCollectionById(this.contentId, this.contentType).then((response) => {
      this.title = response.title;
      this.questions = [];
      const questionContent = response.content;
      const performanceUsage =  this.performance ? this.performance[0].usageData : [];
      questionContent.forEach((content) => {
        const resourcePerformance =  performanceUsage.find((item) => item.gooruOId === content.id );
        const minutes = resourcePerformance ? moment.duration(resourcePerformance.timeSpent).minutes() : 0;
        const hours = resourcePerformance ? Math.trunc(moment.duration(resourcePerformance.timeSpent).asHours()) : 0;
        const collectionQuestion = new CollectionQuestionAddDataModel();
        collectionQuestion.contentFormat = content.contentFormat;
        collectionQuestion.type = content.type;
        collectionQuestion.contentSubformat = content.contentSubformat;
        collectionQuestion.creatorId = content.creatorId;
        collectionQuestion.description = content.description;
        collectionQuestion.id = content.id;
        collectionQuestion.title = content.title;
        collectionQuestion.hours = resourcePerformance ? hours : 0;
        collectionQuestion.minutes = resourcePerformance ? minutes : 0;
        collectionQuestion.timespent = resourcePerformance ? resourcePerformance.timeSpent : 0
        this.questions.push(collectionQuestion);
      });
    });
  }

  /**
   * @function fetchStudentListForAddData
   * This method is used to fetch student list for add data
   */
  public fetchStudentListForAddData() {
    this.classActivityService.fetchClassActivityUserList(this.classId, this.activityId).then((studentListResponse) => {
      this.students = studentListResponse;
    });
  }

  /**
   * @function submitTimespent
   * This method is used to submit timespent
   */
  public submitTimespent() {
    if (this.performance && this.isCollection) {
      this.overwriteCollectionPerformance();
    } else {
      this.submitCollectionPerformanceData();
    }
  }

  /**
   * @function translateValue
   * This method used to translate value
   */
   public translateValue(value) {
    return this.translate.instant(value);
  }

  /**
   * @function submitCollectionPerformanceData
   * This method is used to submit collection performance data
   */
  public submitCollectionPerformanceData() {
    const studentsPerformances = this.students.map((student) => {
      const studentCollectionPerformanceData = this.getCollectionDataParams();
      studentCollectionPerformanceData['session_id'] = generateUUID();
      studentCollectionPerformanceData['student_id'] = student.id;
      return {
        ...studentCollectionPerformanceData,
        student_id: student.id
      };
    });
    if (this.isOnline) {
      const resultPromises = studentsPerformances.map((studentsPerformance) => {
        return this.saveStudentCollectionPerformanceData(studentsPerformance);
      });
      Promise.all(resultPromises).then(() => {
        this.toastService.presentToast(this.translateValue('SAVED_SUCCESSFULLY'), true);
      });
    } else {
      const offlineEvents = studentsPerformances.map((studentsPerformance) => {
        return this.performanceService.serializeOfflineEvents(SYNC_EVENTS.CA_ADD_DATA, {
          class_id: studentsPerformance.class_id,
          course_id: studentsPerformance.course_id,
          source: 'ca'
        }, {
          ...studentsPerformance
        });
      });
      this.performanceService.storeBulkOfflineEvents(offlineEvents).then(() => {
        this.toastService.presentToast(this.translateValue('SAVED_SUCCESSFULLY'), true);
      });
    }
  }


  /**
   * @function saveStudentCollectionPerformanceData
   * This method is used to save student collection data
   */
  public saveStudentCollectionPerformanceData(collectionParams) {
    return this.performanceService.updateCollectionOfflinePerformance(collectionParams);
  }

  /**
   * @function getCollectionDataParams
   * This method is used to get collection data params
   */
  public getCollectionDataParams() {
    const resources = this.questions;
    const collectionResources = [];
    resources.forEach((resource) => {
      collectionResources.push(this.getResourceRequestBody(resource));
    });
    const studentPerformanceData = {
      collection_type: CONTENT_TYPES.COLLECTION,
      resources: collectionResources
    };
    return Object.assign(studentPerformanceData, this.getCollectionRequestBody());
  }

  /**
   * @function getResourceRequestBody
   * This method is used to get resource request body
   */
  public getResourceRequestBody(resource) {
    const resourceParams = {
      resource_id: resource.id,
      resource_type: resource.contentFormat,
      question_type: resource.type
    }
    if (resource.timespent) {
      Object.assign(resourceParams, {
        time_spent: Number(resource.timespent)
      })
    }
    return resourceParams;
  }

  /**
   * @function getCollectionRequestBody
   * This method is used to get collection request body
   */
  public getCollectionRequestBody() {
    const userSession = this.sessionService.userSession;
    return {
      tenant_id: userSession.tenant.tenantId || null,
      class_id: this.classId,
      collection_id: this.contentId,
      content_source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      time_zone: moment.tz.guess() || null,
      conducted_on: this.activationDate,
      path_id: 0,
      path_type: null,
      course_id: this.class.courseId,
      additionalContext: btoa(
        JSON.stringify({
          dcaContentId: this.activityId
        })
      )
    }
  }

  /**
   * @function getExternalCollectionDataParams
   * This method is used to get external collection params
   */
  public getExternalCollectionDataParams(hoursInMs, minutesInMs) {
    const studentIds = this.students.map((item) => item.id);
    const timeSpentInmIlliSec = hoursInMs + minutesInMs;
    const studentPerformanceData = {
      student_id: studentIds,
      unit_id: null,
      lesson_id: null,
      collection_type: this.contentType,
      time_spent: timeSpentInmIlliSec,
      session_id: generateUUID()
    };
    return Object.assign(studentPerformanceData, this.getCollectionRequestBody());
  }

  /**
   * @function overwriteCollectionPerformance
   * Method to overwrite collection performance
   */
  public overwriteCollectionPerformance() {
    let studentCollectionPerformanceData = this.getCollectionDataParams();
    const requestBodyKeysToRest = [
      'conducted_on',
      'path_id',
      'path_type',
      'tenant_id',
      'course_id',
      'additionalContext'
    ];
    studentCollectionPerformanceData = this.resetRequestBodyByKeys(studentCollectionPerformanceData, requestBodyKeysToRest);
    const overwriteSpecifcParams = {
      activity_date: this.activationDate,
      additional_context: btoa(
        JSON.stringify({
          dcaContentId: this.activityId
        })
      )
    };
    studentCollectionPerformanceData = Object.assign(
      studentCollectionPerformanceData,
      overwriteSpecifcParams
    );
    const studentsPerformances = this.students.map((student) => {
      return {
        ...studentCollectionPerformanceData,
        student_id: student.id
      };
    });
    if (this.isOnline) {
      const resultPromises = studentsPerformances.map((studentsPerformance) => {
        return this.overwriteStudentCollectionPerformance(studentsPerformance);
      });
      Promise.all(resultPromises).then(() => {
        this.toastService.presentToast(this.translateValue('SAVED_SUCCESSFULLY'), true);
      });
    } else {
      const offlineEvents = studentsPerformances.map((studentsPerformance) => {
        return this.performanceService.serializeOfflineEvents(SYNC_EVENTS.CA_UPDATE_COLLECTION_DATA, {
          class_id: studentsPerformance.class_id,
          course_id: studentsPerformance.course_id,
          source: 'ca'
        }, {
          ...studentsPerformance
        });
      });
      this.performanceService.storeBulkOfflineEvents(offlineEvents).then(() => {
        this.toastService.presentToast(this.translateValue('SAVED_SUCCESSFULLY'), true);
      });
    }
  }

  /**
   * @function resetRequestBodyByKeys
   * Method to reset request body keys
   */
  public resetRequestBodyByKeys(dataToRest, jsonKeys) {
    jsonKeys.map(key => {
      dataToRest[`${key}`] = undefined;
    });
    return dataToRest;
  }

  /**
   * @function overwriteStudentCollectionPerformance
   * Method to overwrite student collection performance
   */
  public overwriteStudentCollectionPerformance(collectionParams) {
    return this.performanceService.overwriteCollectionPerformance(collectionParams);
  }
}
