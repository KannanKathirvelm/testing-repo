import { ScopeAndSequenceCompetencyModel, ScopeAndSequenceDomainModel, ScopeAndSequenceTopicModel } from '@models/class-activity/scope-and-sequence/scope-and-sequence';
import { TaxonomyGrades } from '@models/taxonomy/taxonomy';
import { createAction, props } from '@ngrx/store';

export const setTaxonomyGrades = createAction(
  '[TaxonomyGrades] SetTaxonomyGrades',
  props<{ key: string; data: Array<TaxonomyGrades> }>()
);

export const setTaxonomyCADomain = createAction(
  '[ScopeAndSequenceDomainModel] SetTaxonomyCADomain',
  props<{ key: string; data: Array<ScopeAndSequenceDomainModel> }>()
);

export const setTaxonomyCATopic = createAction(
  '[ScopeAndSequenceTopicModel] SetTaxonomyCATopic',
  props<{ key: string; data: Array<ScopeAndSequenceTopicModel> }>()
);

export const setTaxonomyCACompetency = createAction(
  '[ScopeAndSequenceCompetencyModel] SetTaxonomyCACompetency',
  props<{ key: string; data: Array<ScopeAndSequenceCompetencyModel> }>()
);
