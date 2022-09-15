import { CollectionsModel } from '@models/collection/collection';
import { PrerequisitesModel } from '@models/competency/competency';
import { TaxonomyModel } from '@models/taxonomy/taxonomy';

export interface SignatureContentModel {
  creator: OwnerModel;
  description: string;
  efficacy: number;
  engagement: number;
  id: string;
  owner: OwnerModel;
  relevance: number;
  thumbnail: string;
  title: string;
  collection: CollectionsModel;
  collectionType: string;
  suggestedContentType: string;
  suggestedContentId: string;
  isAssessment?: boolean;
  isCollection?: boolean;
}

export interface UserSignatureCompetenciesModel {
  [key: string]: string;
}

export interface OwnerModel {
  firstName: string;
  id: string;
  lastName: string;
  profileImage?: string;
  username: string;
  usernameDisplay?: string;
  avatarUrl: string;
}

export interface SearchCompetencyModel {
  code: string;
  contents: SearchContentModel;
  course: string;
  domain: string;
  gutCode: string;
  learningMapsContent: Array<LearningMapsContent>;
  owner?: string;
  prerequisites: PrerequisitesModel;
  signatureContents: ContentTypeModel;
  subject: string;
  title: string;
}

export interface ContentTypeModel {
  [key: string]: Array<SignatureContentModel>;
}

export interface SearchContentModel {
  assessment: SearchContentType;
  assessmentExternal: SearchContentType;
  collection: SearchContentType;
  collectionExternal: SearchContentType;
  course: SearchContentType;
  lesson: SearchContentType;
  offlineActivity: SearchContentType;
  question: SearchContentType;
  resource: SearchContentType;
  rubric: SearchContentType;
  unit: SearchContentType;
}

export interface SearchContentType {
  resultCount: number;
  searchResults: Array<SerachResultModel>;
  totalHitCount: number;
}

export interface LearningMapsContent {
  type: string;
  content: Array<ContentModel>;
  totalHitCount: number;
}

export interface ContentModel {
  collectionType?: string;
  course?: string;
  courseId?: string;
  creator: OwnerModel;
  isResource?: boolean;
  description?: string;
  efficacy?: number;
  engagement?: number;
  format?: string;
  id: string;
  thumbnail?: string;
  contentFormat?: string;
  isCollection?: boolean;
  isAssessment?: boolean;
  isExternalAssessment?: boolean;
  isExternalCollection?: boolean;
  isOA?: boolean;
  isLesson?: boolean;
  isQuestion?: boolean;
  isRubric?: boolean;
  taskCount?: number;
  isCourse?: boolean;
  isVisibleOnProfile?: string;
  learningObjectives?: string;
  owner: OwnerModel;
  publishStatus?: string;
  questionCount?: number;
  relevance?: number;
  remixCount?: string;
  resourceCount?: number;
  lessonCount?: number;
  standards: Array<TaxonomyModel>;
  thumbnailUrl?: string;
  title: string;
  version?: string;
  unitCount?: string;
  publisher?: Array<string>;
  subjectSequence?: string;
  subjectName?: string;
  subject?: string;
  contentSubFormat?: string;
  type?: string;
  lastModified?: string;
  assessmentCount?: string;
  collectionCount?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  isPublished?: boolean;
  sequence?: number;
  url?: string;
  isOfflineActivity?: boolean;
  contentId?: string;
  contentType?: string;
  taxonomy?: Array<TaxonomyModel>;
}
export interface AnswerModel {
  answerId: string;
  answerText: string;
  answerType: string;
}
export interface SerachResultModel {
  answers?: Array<AnswerModel>;
  collaboratorCount: number;
  collectionItemCount?: number;
  collectionRemixCount?: number;
  creator: OwnerModel;
  efficacy: number;
  engagement: number;
  format: string;
  contentFormat: string;
  explanation: string;
  grade?: string;
  id: string;
  isCrosswalked: boolean;
  hasFrameBreaker?: boolean;
  isFeatured: boolean;
  learningObjective?: string;
  publishStatus: string;
  hints?: string;
  publisher?: Array<string>;
  questionText?: string;
  originalCreator?: string;
  questionCount?: number;
  lessonCount?: number;
  remixedInAssessmentCount?: number;
  externalAssessmentCount?: number;
  remixedInCollectionCount?: number;
  relevance: number;
  assessmentCount?: number;
  collectionCount?: number;
  remixedInClassCount?: number;
  remixedInCourseCount?: number;
  resourceCount?: number;
  taskCount?: number;
  taxonomy: TaxonomyModel;
  thumbnail: string;
  title: string;
  url?: string;
  usedByStudentCount?: number;
  user?: OwnerModel;
  viewCount?: number;
}
