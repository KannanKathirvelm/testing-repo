import { TaxonomyModel } from '@models/taxonomy/taxonomy';

export interface ClassCompetencySummaryModel {
  classId: string;
  completedCompetencies: number;
  totalCompetencies: number;
  completionPercentage: number;
  inprogressCompetencies: number;
  masteredCompetencies: number;
}
export interface CurrentLocation {
  classId: string;
  collectionId: string;
  collectionTitle: string;
  collectionType: string;
  courseId: string;
  lessonId: string;
  milestoneId: string;
  pathId: number;
  pathType: string;
  scoreInPercentage: number;
  status: string;
  unitId: string;
}

export interface TopicsModel {
  competencies: Array<TopicsCompetencyModel>;
  completedCompetencies: number;
  domainCode: string;
  domainSeq: number;
  inferredCompetencies: number;
  inprogressCompetencies: number;
  masteredCompetencies: number;
  notstartedCompetencies: number;
  topicCode: string;
  topicDesc: string;
  topicName: string;
  topicSeq: number;
  fwTopicName?: string;
}

export interface CompetencyCompletionStatusModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStudentDesc: string;
  domainCode: string;
  domainSeq: number;
  source: string;
  status: number;
  topicCode: string;
  topicSeq: number;
}

export interface DomainTopicsModel {
  completedCompetencies: number;
  domainCode: string;
  domainName: string;
  domainSeq: number;
  inferredCompetencies: number;
  inprogressCompetencies: number;
  isActive: boolean;
  isExpanded: boolean;
  masteredCompetencies: number;
  notstartedCompetencies: number;
  topics: Array<TopicsModel>;
  totalCompetencies: number;
  isShowMasteredCompetency?: boolean;
  compSeqList?: Array<number>;
  fwDomainName: string;
}

export interface SelectedTopicsModel {
  topic: TopicsModel;
  domain: DomainTopicsModel;
  competency: TopicsCompetencyModel;
}

export interface TopicsCompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStatus?: number;
  competencyStudentDesc: string;
  domainCode?: string;
  domainName?: string;
  domainSeq?: number;
  isGradeBoundary?: boolean;
  isInferred?: boolean;
  isMastered?: boolean;
  isSkylineCompetency?: boolean;
  source: string;
  status: number;
  topicCode?: string;
  topicSeq?: number;
  domainLevelCompetencySeq?: number;
  isExpanded?: boolean;
  isClassGrade?: boolean;
}

export interface DomainTopicCompetencyMatrixModel {
  completedCompetencies?: number;
  domainCode: string;
  inferredCompetencies?: number;
  inprogressCompetencies?: number;
  masteredCompetencies?: number;
  notstartedCompetencies?: number;
  topics: Array<TopicMatrixModel>;
  totalCompetencies?: number;
}

export interface TopicMatrixModel {
  competencies: Array<TopicsCompetencyModel>;
  completedCompetencies?: number;
  inferredCompetencies?: number;
  inprogressCompetencies?: number;
  masteredCompetencies?: number;
  notstartedCompetencies?: number;
  topicCode: string;
  isSkyLineCompetency?: boolean;
  topicSeq: number;
}

export interface TopicsCompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStatus?: number;
  competencyStudentDesc: string;
  domainCode?: string;
  domainName?: string;
  domainSeq?: number;
  isGradeBoundary?: boolean;
  isInferred?: boolean;
  isMastered?: boolean;
  isSkylineCompetency?: boolean;
  source: string;
  status: number;
  topicCode?: string;
  topicSeq?: number;
  domainLevelCompetencySeq?: number;
  isExpanded?: boolean;
  isMappedWithFramework?: boolean;
}

export interface SkyLineCompetencyModel {
  domainSeq: number;
  isExpanded?: boolean;
  skylineCompetencySeq: number;
  topicSkylinePoints: Array<TopicSkylinePointsModel>;
}

export interface UserSubjectCompetencySkylinePointsModel {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GradeBoundaryPointsModel {
  domainSeq: number;
  hiLineCompSeq: number;
  isExpanded: boolean;
  isHiLineAvailable?: boolean;
  skylineCompetencySeq?: number;
  topics: Array<{
    hiLineCompSeq: number;
    topicSeq: number;
    skylineCompetencySeq?: number;
  }>;
}

export interface TopicSkylinePointsModel {
  skylineCompetencySeq: number;
  topicSeq: number;
}

export interface MatrixCoordinatesModel {
  domainCode: string;
  domainName: string;
  domainSeq: number;
  topics: Array<MatrixCoordinatesTopicsModel>;
}

export interface MatrixCoordinatesTopicsModel {
  domainCode: string;
  domainSeq: number;
  topicCode: string;
  topicDesc: string;
  topicName: string;
  topicSeq: number;
}

export interface CompetenciesStrugglingPerformanceModel {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  thumbnail: string;
  username: string;
  performanceScore: number;
}

export interface StrugglingCompetencyModel {
  gradeId: number;
  grade: string;
  gradeSeq: number;
  description: string;
  fwCode: string;
  domains: Array<StrugglingDomainModel>;
  isLearningChallenges?: boolean;
}

export interface StrugglingDomainModel {
  competencies: Array<StrugglingDomainCompetencyModel>;
  domainCode: string;
  domainId: string;
  domainName: string;
  domainSeq: number;
}

export interface StrugglingDomainCompetencyModel {
  competencies?: Array<StrugglingDomainCompetencyModel>;
  mastered?: number;
  totalCoverage?: number;
  notStarted?: number;
  inProgress?: number;
  code: string;
  displayCode: string;
  name: string;
  domainIndex?: number;
  gradeIndex?: number;
  domainName?: string;
  sequence: number;
  studentsDescription: string;
  studentsCount: string;
}

export interface CompetencyStyleModel {
  left: string;
  top: string;
  width: string;
  height: string;
}
export interface SelectedCompetencyModel {
  competency: CompetencyModel;
  domainCompetencyList: DomainModel;
  showFullReport?: boolean;
}

export interface DomainModel {
  domainName: string;
  domainSeq: number;
  domainCode: string;
  competencies?: Array<CompetencyModel>;
  fwDomainName? : string;
  topic?: Array<TopicsModel>;
}

export interface CrossWalkSubjectModel {
  [key: string]: Array<DomainModel>;
}

export interface ContenxtModel {
  classId: string;
  courseId: string;
  filter: string;
  fromMonth: string;
  fromYear: string;
  subjectCode: string;
  toMonth: number;
  toYear: number;
}

export interface CompetenciesModel {
  competencies: Array<CompetencyModel>;
  domainCode: string;
  domainName: string;
  domainSeq: number;
}

export interface DomainsCompetencyPerformanceModel {
  domainData: StudentDomainData;
  studentCompetencies: Array<StudentCompetencies>;
}

export interface SelectedStudentDomainCompetencyModel {
  competency: CompetencyModel;
  domainCompetencyList: Array<CompetencyModel>;
  selectedStudent?: StudentCompetencies;
  selectedStudents?: Array<StudentCompetencies>;
}

export interface StudentDomainData {
  competencies: Array<CompetencyModel>;
  competencyLength: number;
  domainCode: string;
  domainName: string;
  domainSeq: number;
}

export interface StudentCompetencies {
  avatarUrl: string;
  competencies: Array<CompetencyModel>;
  firstName: string;
  fullName: string;
  lastName: string;
  userId?: string;
  id?: string;
  isActive: boolean;
}

export interface DomainCompetencyCoverageModel {
  domainCode: string;
  domainName: string;
  domainSeq: number;
  inProgress: number;
  notStarted: number;
  mastered: number;
  totalCoverage: number;
}

export interface CompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStudentDesc: string;
  displayCode?: string;
  isClassGrade?: boolean;
}

export interface StudentsModel {
  id: string;
  userCompetencyMatrix?: Array<UserCompetencyMatrixModel>;
}

export interface FwCompetenciesModel {
  [key: string]: FwCompetencyModel;
}

export interface CrossWalkModel {
  domainName: string;
  domainSeq: number;
  domainCode: string;
  fwDomainName: string;
  competencies: Array<FwCompetencyModel>;
  topics: Array<TopicsModel>;
}

export interface FwCompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStudentDesc: string;
  frameworkCompetencyCode: string;
  frameworkCompetencyDisplayCode: string;
  frameworkCompetencyName: string;
  loCode: string;
  loName: string;
}

export interface CompetencyMatrixModel {
  topics?: Array<TopicsModel>;
  competencies?: Array<CompetencyModel>;
  domainCode: string;
  domainName: string;
  domainSeq: number;
  compSeqList?: Array<number>;
  classGradeCompetencies?: number;
}

export interface UsercompetencyModel {
  [key: string]: number;
}

export interface StudentDomainCompetenciesModel {
  domainCompetencies: Array<DomainCompetenciesModel>;
  email: string;
  firstName: string;
  fullName: string;
  id: string;
  lastName: string;
  thumbnail: string;
  username: string;
  isShowLearnerData: boolean;
}

export interface DomainCompetenciesModel {
  actualCompetencies: Array<DomainCompetencyModel>;
  competencies: Array<DomainCompetencyModel>;
  domainCode: string;
  domainName: string;
  domainSeq: number;
  inProgress: number;
  notStarted: number;
  mastered: number;
  totalCoverage: number;
}

export interface DomainCompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStatus: number;
  competencyStudentDesc: string;
  isSkyLineCompetency: boolean;
}

export interface PrerequisitesModel {
  code: string;
  id: string;
  status?: number;
  title: string;
  codeType?: string;
  isActive?: boolean;
  isSelectable?: boolean;
  parentTaxonomyCodeId?: string;
  sequenceId?: string;
  label?: string;
}

export interface MicroCompetenciesModel {
  code: string;
  codeType: string;
  id: string;
  isActive: boolean;
  isSelectable: boolean;
  parentTaxonomyCodeId: string;
  sequenceId: number;
  title: string;
}

export interface CompetencyModel {
  competencyCode: string;
  competencyDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyStudentDesc: string;
  status: number;
  competencyStatus?: number;
  domainCode?: string;
  domainName?: string;
  domainSeq?: number;
  isMastered?: boolean;
  isSkyLineCompetency?: boolean;
  isInferred?: boolean;
  isGradeBoundary?: boolean;
  className?: string;
  isLowline?: boolean;
  showSignatureAssessment?: boolean;
  isNoMapping?: boolean;
  isActive?: boolean;
  noFrameWork: boolean;
  isMappedWithFramework: boolean;
  framework: TaxonomyModel;
  isInferredCompetency?: boolean;
}

export interface DomainLevelSummaryModel {
  context: ContenxtModel;
  students?: Array<StudentsModel>;
  domainCompetencies?: Array<DomainLevelCompetenciesModel>;
}

export interface UserCompetencyMatrixModel {
  domainCode: string;
  domainName: string;
  domainSeq: number;
  topics?: Array<UserCompetencyTopicsModel>;
  competencies?: Array<UserCompetenciesModel>;
}

export interface UserCompetencyTopicsModel {
  topicCode: string;
  topicName: string;
  topicSeq: number;
  competencies?: Array<UserCompetenciesModel>;
}

export interface UserCompetenciesModel {
  topicCode: string;
  topicSeq: number;
  topicName: string;
  domainCode: string;
  domainName: string;
  domainSeq: number;
  competencyStatus: number;
  competencyStudentDesc: string;
  competencyName: string;
  competencySeq: number;
  competencyDesc?: string;
  competencyCode: string;
}

export interface DomainLevelCompetenciesModel {
  domainCode: string;
  domainName: string;
  domainSeq: number;
  competencies?: Array<DomainLevelCompetenciesModel>;
  topics?: Array<DomainLevelTopicsModel>;
}

export interface DomainLevelCompetenciesModel {
  competencyCode: string;
  competencyName: string;
  competencyDesc?: null;
  competencyStudentDesc: string;
  competencySeq: number;
  topicCode: string;
  topicName: string;
  topicSeq: number;
  domainName: string;
  domainCode: string;
  domainSeq: number;
}

export interface DomainLevelTopicsModel {
  topicCode: string;
  topicName: string;
  topicSeq: number;
  competencies?: Array<DomainLevelCompetenciesModel>;
}

export interface StudentsCompetencyModel {
  competencyCode: string;
  description: string;
  displayCode: string;
  students: Array<StudentCompetencyModel>;
  title: string;
}

export interface StudentCompetencyModel {
  firstName: string;
  lastName: string;
  score: number;
  status: number;
  suggestions: number;
  thumbnail: string;
  userId: string;
  fullName: string;
}
