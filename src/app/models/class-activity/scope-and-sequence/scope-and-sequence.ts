import { ContentModel } from '@models/signature-content/signature-content';

export interface ContentSourceModel {
  key: string;
  name: string;
  sequenceId: number;
}

export interface SequenceModel {
  filters?: any;
  isActive: boolean;
  key: string;
  name: string;
  seq_id: number
}

export interface ContentTypeModel {
  apiKey: string;
  format: string;
  label: string;
  seqId: number
}

export interface ScopeAndSequenceModel {
  code: string;
  defaultTaxonomyCourseId: string;
  domainsList?: Array<ScopeAndSequenceDomainModel>;
  modulesList?: Array<ScopeAndSequenceModuleModel>;
  id: string;
  sequenceId: number;
  title: string;
  scopeId?: number;
}

export interface SNSScopeModel {
  domains: any;
  competencies: any;
  topics: any;
}

export interface ScopeAndSequenceDomainModel {
  code: string;
  defaultTaxonomyDomainId: string;
  id: string;
  isActive?: boolean;
  isTopicLoaded: boolean;
  sequenceId: number;
  title: string;
  topicsList?: Array<ScopeAndSequenceTopicModel>;
  domainCode?: string;
}

export interface ScopeAndSequenceTopicModel {
  code: string;
  defaultTaxonomyTopicId: string;
  description: string;
  id: string;
  isActive?: boolean;
  isCompetencyLoaded: boolean;
  sequenceId: number;
  title: string;
  competenciesList?: Array<ScopeAndSequenceCompetencyModel>
}

export interface ScopeAndSequenceCompetencyModel {
  code: string;
  codeType?: string;
  hasContent: boolean;
  id: string;
  isActive?: boolean;
  isContentLoaded?: boolean;
  isSelectable?: boolean;
  levelName?: Array<number>;
  parentTaxonomyCodeId: string;
  sequenceId: number;
  studentsContent?: Array<ContentModel>;
  studentsContentLoading?: boolean;
  studentsSkipedLevels?: Array<number>;
  studentspage?: number;
  teachersContent?: Array<ContentModel>;
  teachersContentLoading?: boolean;
  teachersSkipedLevels?: Array<number>;
  teacherspage?: number;
  title: string;
}

export interface ScopeAndSequenceModuleModel {
  description: string;
  durationDays: number;
  grade: string;
  gradeId: number;
  id: number;
  sequence: number;
  title: string;
  isActive?: boolean;
  topicsList?: Array<ScopeAndSequenceModuleTopicModel>;
}

export interface ScopeAndSequenceModuleTopicModel {
  description: string;
  durationDays: number;
  id: number;
  isActive: boolean;
  sequence: number;
  title: string;
  competenciesList?: Array<ScopeAndSequenceCompetencyModuleModel>;
}

export interface ScopeAndSequenceCompetencyModuleModel{
  code: string;
  competencyMetadata: string;
  description: string;
  displayCode: string;
  reviewCompetency: boolean;
  sequence: number;
  title: string;
  isActive?: boolean;
  isContentLoaded?: boolean;
  isSelectable?: boolean;
  levelName?: Array<number>;
  studentsContent?: Array<ContentModel>;
  studentsContentLoading?: boolean;
  studentsSkipedLevels?: Array<number>;
  studentspage?: number;
  teachersContent?: Array<ContentModel>;
  teachersContentLoading?: boolean;
  teachersSkipedLevels?: Array<number>;
  teacherspage?: number;
}
