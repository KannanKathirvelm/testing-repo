export interface TaxonomyKeyModel {
  [key: string]: {
    code: string;
    title: string;
    parent_title: string;
    framework_code: string;
  };
}

export interface TaxonomyModel {
  code: string;
  id: string;
  title: string;
  frameworkCompetencyCode?: string;
  isDefault?: boolean;
  frameworkId?: string;
}

export interface TaxonomySubjectModel {
  code: string;
  description: string;
  frameworks: Array<TaxonomyModel>;
  id: string;
  standardFrameworkId: string;
  title: string;
}

export interface TaxonomyGrades {
  grade: string;
  description: string;
  id: number;
  sequence?: number;
  thumbnail?: string;
  code: string;
  frameworkId?: string;
  sequenceId?: number;
  showGradeLevel?: boolean;
  levels?: Array<GradeLevels>;
  parentGradeId?: number;
}

export interface GradeLevels {
  id: number;
  label?: string;
  grade?: string;
  description: string;
  levelSequence: number;
  parentGradeId: number;
}

export interface GradeCompetency {
  grade: string;
  name?: string;
  description: string;
  id: number;
  sequence: number;
  thumbnail: string;
  totalCompetencies: number;
}

export interface TaxonomyGradesSubjectmodel {
  [key: string]: Array<TaxonomyGrades>;
}

export interface CategoryClassificationModel {
  code: string;
  id: string;
  isLoad: boolean;
  subjectList: Array<SubjectModel>;
  title: string;
}

export interface SubjectModel {
  code: string;
  description?: string;
  frameworks?: Array<FrameworkModel>;
  id: string;
  standardFrameworkId?: string;
  title?: string;
  sequenceId?: number;
  frameworkId?: string;
}

export interface DiagnostictModel {
  title?: string;
  label?: string;
  isActive: boolean;
}

export interface GradeBoundaryModel {
  domainCode?: string;
  highline?: string;
  highlineTopic: string;
  highlineComp?: string;
  averageComp?: string;
  topicAverageComp?: string;
  topicHighlineComp: string;
  topicCode: string;
}

export interface MultiGradeActiveList {
  [key: number]: GradeBoundaryModel;
}

export interface FrameworkModel {
  standardFrameworkId: string;
  taxonomySubjectId: string;
  taxonomySubjectTitle: string;
  title: string;
}

export interface TaxonomyFwSubjectContent {
  code: string;
  defaultTaxonomyCourseId: string;
  id: string;
  sequenceId: number;
  title: string;
  label?: string;
  isActive?: boolean;
}

export interface CADomainModel {
  code: string;
  defaultTaxonomyDomainId: string;
  id: string;
  sequenceId: number;
  title: string;
}

export interface CATopicModel {
  code: string;
  defaultTaxonomyTopicId: string;
  description: string;
  id: string;
  sequenceId: string;
  title: string;
}

export interface CACompetencyModel {
  code: string;
  codeType: string;
  id: string;
  isSelected: boolean;
  parentTaxonomyCodeId: string;
  sequenceId: string;
  title: string;
}

export interface TaxonomyStandardModel {
  code: string;
  description: string;
  frameworkCode: string;
  id: string;
  parentTitle: string;
  taxonomyLevel: string;
  title: string;
}
