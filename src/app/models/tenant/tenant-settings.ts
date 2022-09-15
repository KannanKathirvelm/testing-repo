export interface TenantSettingsModel {
  translationSetting?: {
    language: string;
  };
  allowMultiGradeClass: string;
  classSettingShowStudentInfo: string;
  classSettingShowMultiGrade?: boolean;
  showPresentDiagnostic?: boolean;
  competencyCompletionDefaultMinScore: number;
  competencyCompletionMinScore: CompetencyCompletionMinScoretModel;
  competencyCompletionThresholdForAssessment: CompetencyCompletionThresholdForAssessmentModel;
  enableClsVideoConfSetup: string;
  groupHierarchy: string;
  filterNonPremiumCourse?: string;
  navigatorClassSetting: NavigatorClassSettingModel;
  txSubClassifierPrefs: TxSubClassifierPrefsModel;
  txSubPrefs: TxSubPrefsModel;
  showClassRoasterSyncControl: string;
  hideRoute0Setting: string;
  preferredFacetSubjectCodes: Array<string>;
  useLearnerDataVisibiltyPref: string;
  defaultSkylineGradeDiffForDiagnostic?: number;
  preferredMeetingTool: string;
  enableCommunityCollaboration: string;
  isCaAutoAssignToStudent: boolean;
  fluencyLevel?: string;
  domainDiagnosticEnabled?: boolean;
  defaultSkylineGradeDiff: {
    [key: string]: number
  };
  twFwPref: {
    [key: string]: FwIdsModel
  };
  uiElementVisibilitySettings: {
    enableCreateClass?: boolean;
    classCreateShowSubjectCards?: boolean;
    showQuestionEvidence: boolean;
    showReactionOnly: boolean;
    lessonLabelCourseMap?: string;
    questionEvidenceVisibility?: {
      default: boolean;
      fillInTheBlankQuestion: boolean;
      hotTextReorderQuestion: boolean;
      multipleAnswerQuestion: boolean;
      multipleChoiceQuestion: boolean
      openEndedQuestion: boolean;
      trueFalseQuestion: boolean;
    }
    poChartYaxisLabel : boolean;
    displayDomainLabel: boolean;
    atcViewDefaultProgressSelection: string;
    hideCourseMapViewContentLabelSeq?: boolean;
  }
  navigatorRouteMapViewApplicable: {
    [key: string]: boolean
  };
  showIncompleteClassrooms?: boolean;
  enableForcePasswordChange?: boolean;
  courseContentVisibility: boolean;
  caBaselineWorkflow?: boolean;
}

export interface TenantLibraryContentModel {
  id: string;
  name: string;
  image: string;
  description: string;
  tenantId: string;
  tenantRoot: string;
  courseCount: number;
  assessmentCount: number;
  collectionCount: number;
  resourceCount: number;
  questionCount: number;
  rubricCount: number;
  offlineActivityCount: number;
  sequence: number;
  shortName: string;
}

export interface FwIdsModel {
  fw_ids: Array<string>;
}

export interface TxSubClassifierPrefsModel {
  defaultubClassificationId: string;
  isGlobalVisible: boolean;
  ids: Array<string>;
}

export interface TxSubPrefsModel {
  subject: string;
  defaultGutSubjectCode: string;
  isGlobalVisible: boolean;
}

export interface CompetencyCompletionMinScoretModel {
  [key: string]: number;
}

export interface CompetencyCompletionThresholdForAssessmentModel {
  [key: string]: number;
}

export interface NavigatorClassSettingModel {
  subjectCode: string;
  classOrigin: number;
  classVersion: string;
  courseId: string;
  diagnosticApplicable: boolean;
  framework: string;
  route0Applicable: boolean;
  studentMathLevel: number;
}
