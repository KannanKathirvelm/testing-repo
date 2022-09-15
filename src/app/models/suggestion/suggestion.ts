import { PlayerPerformanceModel } from '@models/player/player';
import { TaxonomyKeyModel } from '@models/taxonomy/taxonomy';

export interface SuggestionModel {
  id: number;
  unitId: string;
  lessonId: string;
  collectionId: string;
  classId: string;
  suggestedContentId: string;
  suggestedContentType: string;
  suggestedTo: string;
  suggestionArea: string;
  suggestionCriteria: string;
  suggestionOrigin: string;
  suggestionOriginatorId: string;
  pathId: number;
  userId: string;
  questionType: string;
  resourceCount: number;
  questionCount: number;
  courseId: string;
  createdAt: number;
  txCodeType: string;
  txCode: string;
  acceptedAt: number;
  accepted: boolean;
  updatedAt: number;
  collectionType?: string;
  isCollection?: boolean;
  isAssessment?: boolean;
  isExternalAssessment?: boolean;
  isOfflineActivity?: boolean;
  isExternalCollection?: boolean;
  caId?: number;
  title?: string;
  thumbnail?: string;
  url?: string;
  taxonomy?: Array<TaxonomyKeyModel>;
  resource_count?: number;
  isCourseMap?: boolean;
  isClassActivity?: boolean;
  isProficiency?: boolean;
  performance?: PlayerPerformanceModel;
  format?: string;
}

export interface SuggestionFilterModel {
  key: string;
  title: string;
  value: string;
  isSuggested?: boolean;
}

export interface SuggestionsModel {
  suggestions: Array<SuggestionModel>;
  total: number;
}

export interface CASuggestionModel {
  caId: number;
  suggestedContents?: Array<CASuggestedContentModel>;
  total: number;
}

export interface CASuggestedContentModel {
  classId: string;
  collectionId: string;
  performance?: PlayerPerformanceModel;
  question_count: number;
  suggestedContentId: string;
  suggestedContentType: string;
  thumbnail: string;
  title: string;
  url?: string;
  taxonomy?: Array<TaxonomyKeyModel>;
  userCount: number;
  suggestedForContent: CASuggestionForContextModel;
  suggestedToContext: Array<CASuggestionToContextModel>;
}

export interface CASuggestionForContextModel {
  collectionId: string;
  question_count: number;
  taxonomy?: Array<TaxonomyKeyModel>;
  thumbnail: string;
  title: string;
  url?: string;
}

export interface CASuggestionToContextModel {
  createdAt: number;
  id: number;
  suggestedTo: string;
  suggestionArea: string;
  suggestionCriteria: string;
  suggestionOrigin: string;
  suggestionOriginatorId: string;
  updatedAt: number;
  userId: string;
}
