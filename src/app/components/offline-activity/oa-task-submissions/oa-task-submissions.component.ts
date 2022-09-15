import { Component, Input, OnInit } from '@angular/core';
import { FILE, IMAGE, OA_TASK_SUBMISSION_TYPES } from '@constants/helper-constants';
import { StudentTaskSubmissionModel, TaskModel } from '@models/offline-activity/offline-activity';

@Component({
  selector: 'oa-task-submissions',
  templateUrl: './oa-task-submissions.component.html',
  styleUrls: ['./oa-task-submissions.component.scss'],
})

export class OaTaskSubmissionsComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public task: TaskModel;
  @Input() public isPreview: boolean;
  public typeBasedMandatoryUploads: Array<{type: string; mandatorySubmissionCount: number; isUploaded: boolean; pendingCount: number}>;
  public studentTaskSubmissions: Array<StudentTaskSubmissionModel>;
  public studentTaskUploadSubmission: Array<StudentTaskSubmissionModel>;
  public studentTaskUrlSubmission: Array<StudentTaskSubmissionModel>;

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.typeBasedMandatoryUploads = [];
    const oaTaskUploadSubmissions = this.task.oaTaskSubmissions;
    OA_TASK_SUBMISSION_TYPES.map((submissionType) => {
      const type = submissionType.value;
      const typeBasedSubmission = oaTaskUploadSubmissions.filter((item) => item.taskSubmissionSubType === type);
      if (typeBasedSubmission.length) {
        const typeBasedSubmissionCount = {
          type,
          mandatorySubmissionCount: typeBasedSubmission.length,
          isUploaded: false,
          pendingCount: typeBasedSubmission.length
        }
        this.typeBasedMandatoryUploads.push(typeBasedSubmissionCount);
      }
    });
    this.studentTaskSubmissions = this.task.studentTaskSubmissions ? this.task.studentTaskSubmissions : [];
    this.studentTaskUploadSubmission = this.studentTaskSubmissions.filter((item) => item.submissionType === 'uploaded');
    this.studentTaskUrlSubmission = this.studentTaskSubmissions.filter((item) => item.submissionType === 'remote');
  }

  /**
   * @function checkSubmissionImage
   * This method is used to check the uploaded image
   */
  public checkSubmissionImage(uploaded) {
    return uploaded.submissionSubtype === IMAGE;
  }

  /**
   * @function checkSubmissionIcons
   * This method is used to check the uploaded file
   */
  public checkSubmissionIcons(uploaded) {
    return uploaded.submissionIcon === FILE;
  }
}
