import { ScopeAndSequenceDomainModel, ScopeAndSequenceTopicModel } from '@models/class-activity/scope-and-sequence/scope-and-sequence';
import { PrerequisitesModel } from '@models/competency/competency';
import { DiagnostictModel, SubjectModel, TaxonomyFwSubjectContent, TaxonomyGrades, TaxonomyModel } from '@models/taxonomy/taxonomy';

export interface AudiencesAndEducationalModel {
  id: string;
  label: string;
  sequenceId: number;
  isActive?: boolean;
}

export interface LanguageModel {
  description: string;
  displayName: string;
  id: number;
  name: string;
  label: string;
  sequenceId: number;
  isActive?: boolean;
}

export class SearchFilterItemsModel {
  public description?: string;
  public displayName?: string;
  public id: string;
  public name?: string;
  public label?: string;
  public sequenceId?: number;
  public isActive?: boolean;
  public code?: string;
  public status?: number;
  public title?: string;
  public codeType?: string;
  public isSelectable?: boolean;
  public parentTaxonomyCodeId?: string;
  public defaultTaxonomyCourseId?: string;
  public defaultTaxonomyDomainId?: string;
  public isTopicLoaded?: boolean;
  public topicsList?: Array<ScopeAndSequenceTopicModel>
}

export class SearchFilterContextModel {
  public audiencesContext: Array<AudiencesAndEducationalModel>;
  public languagesContext: Array<LanguageModel>;
  public educationalUsesContext: Array<AudiencesAndEducationalModel>;
  public domainsContext: Array<ScopeAndSequenceDomainModel>;
  public competenciesContext: Array<PrerequisitesModel>;
  public subjectsContext: Array<SubjectModel>;
  public categoriesContext: Array<TaxonomyModel>;
  public taxonomyGradesContext: Array<TaxonomyFwSubjectContent>;
  public diagnosticContext: Array<DiagnostictModel>;
  public frameworkId: string;
  public subject: SubjectModel;
  public category: SubjectModel;
  public grade: TaxonomyGrades;
  public domain: ScopeAndSequenceDomainModel;
  public competencies: Array<PrerequisitesModel>;
  public audiences: Array<AudiencesAndEducationalModel>;
  public languages: Array<LanguageModel>;
  public educationalUses: Array<AudiencesAndEducationalModel>;
  public diagnostic: Array<DiagnostictModel>;
  public isCancel?: boolean;
}

export interface CountryModel {
  code: string;
  id: string;
  name: string;
}

export interface PouchDBModel {
  value: any;
  _id: string;
  _rev: string;
}
