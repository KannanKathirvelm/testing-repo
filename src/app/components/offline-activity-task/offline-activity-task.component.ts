import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OA_TASK_SUBMISSION_TYPES } from '@app/constants/helper-constants';
import { ReferenceModel, TaskModel } from '@app/models/offline-activity/offline-activity';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'offline-activity-task',
  templateUrl: './offline-activity-task.component.html',
  styleUrls: ['./offline-activity-task.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })],
})
export class OfflineActivityTaskComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Array} expectedTaskSubmissions
   * Property for list of expected task submission
   */
  get expectedTaskSubmissions() {
    return this.task.oaTaskSubmissions;
  }

  /**
   * @property {Array} expectedUploadedSubmissions
   * Property for list of expected upload submission
   */
  get expectedUploadedSubmissions() {
    return this.expectedTaskSubmissions.filter((submission) => {
      return submission.taskSubmissionType === 'uploaded';
    });
  }

  /**
   * @property {Array} expectedUrlSubmissions
   * Property for list of expected url submission
   */
  get expectedUrlSubmissions() {
    return this.expectedTaskSubmissions.filter((submission) => {
      return submission.taskSubmissionType === 'remote';
    });
  }

  /**
   * @property {Array} submittedUploads
   * Property for list of submitted task uploads
   */
  get submittedUploads() {
    let submittedUploads = [];
    if (this.task.submissions && this.task.submissions['uploaded']) {
      submittedUploads = this.task.submissions['uploaded'].length ? this.task.submissions['uploaded'] : [];
    }
    return submittedUploads;
  }

  /**
   * @property {Array} submittedUrls
   * Property for list of submitted task urls
   */
  get submittedUrls() {
    let submittedUrls = [];
    if (this.task.submissions && this.task.submissions['remote']) {
      submittedUrls = this.task.submissions['remote'].length ? this.task.submissions['remote'] : [];
    }
    return submittedUrls;
  }

  /**
   * @property {string} submittedAnswerText
   * Property for submitted answer text
   */
  get submittedAnswerText() {
    let submittedAnswerText = '';
    if (this.task.submissions && this.task.submissions['freeFormText']) {
      submittedAnswerText = this.task.submissions['freeFormText'].length ? this.task.submissions['freeFormText'][0].submissionInfo : '';
    }
    return submittedAnswerText;
  }

  /**
   * @property {String} answerText
   * @getter Property for submitted answer text
   */
  get answerText() {
    return this.submittedAnswerText;
  }

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {TaskModel} task
   * Property for offline activity task
   */
  @Input() public task: TaskModel;
  @Input() public isContentPreview: boolean;
  @Input() public references: Array<ReferenceModel>;

  /**
   * @property {number} oaTimespent
   * Property for offline activity timespent
   */
  @Input() public oaTimespent: number;

  /**
   * @property {boolean} isPreview
   * Property to check whether the OA is completed or not
   */
  @Input() public isPreview;

  /**
   * @property {boolean} isStudyPlayer
   * Property to check whether it's a study player or not
   */
  @Input() public isStudyPlayer: boolean;

  /**
   * @property {boolean} isShowSubmission
   * Property to show/hide submission container
   */
  @Input() public sequenceId: number;
  @Output() public taskValidate: EventEmitter<{ index: number, isValid: boolean }> = new EventEmitter();

  /**
   * Property for list of url submission in request payload
   */
  public mandatoryFileUpload: Array<{ type: string, mandatorySubmissionCount: number, isUploaded: boolean, pendingCount: number }>;

  /**
   * @property {boolean} isSaving
   * Property to check whether the task is saving or not
   */
  public pendingUploadSubmissions: number;
  public submittedtFiles: number;
  public isSubmitted: boolean;
  public isShowSubmission = false;

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    if (this.isPreview) {
      this.isShowSubmission = !this.isShowSubmission;
    } else {
      this.mandatoryFileUpload = [];
      this.pendingUploadSubmissions = 0;
      this.submittedtFiles = 0;
      this.isSubmitted = false;
      this.typeBasedMandatoryUploads();
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function typeBasedMandatoryUploads
   * This method is used to check mandatory file upload
   */
  public typeBasedMandatoryUploads() {
    this.mandatoryFileUpload = [];
    const oaTaskUploadSubmissions = this.task.oaTaskSubmissions;
    OA_TASK_SUBMISSION_TYPES.map((submissionType) => {
      const type = submissionType.value;
      const typeBasedSubmission = oaTaskUploadSubmissions.filter((taskSubmission) => taskSubmission.taskSubmissionSubType === type);
      if (typeBasedSubmission.length) {
        const typeBasedSubmissionCount = {
          type,
          mandatorySubmissionCount: typeBasedSubmission.length,
          isUploaded: false,
          pendingCount: typeBasedSubmission.length
        };
        this.pendingUploadSubmissions = (this.pendingUploadSubmissions + typeBasedSubmission.length);
        this.mandatoryFileUpload.push(typeBasedSubmissionCount);
      }
    });
    this.checkValidation();
  }

  /**
   * @function checkValidation
   * This method is used to check validation
   */
  public checkValidation() {
    const submissions = this.task.submissions;
    this.submittedtFiles = (submissions && submissions['uploaded']) ? submissions['uploaded'].length : 0;
    const isValid = this.pendingUploadSubmissions ? this.pendingUploadSubmissions <= this.submittedtFiles : this.isSubmitted ? true : this.answerText.length > 0;
    this.taskValidate.emit({ index: (this.sequenceId - 1), isValid });
    this.pendingUploadSubmissions = this.pendingUploadSubmissions > this.submittedtFiles ? this.pendingUploadSubmissions - this.submittedtFiles : 0;
  }
}
