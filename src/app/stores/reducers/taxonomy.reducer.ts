import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setTaxonomyCACompetency, setTaxonomyCADomain, setTaxonomyCATopic, setTaxonomyGrades } from '@stores/actions/taxonomy.action';

const stateValue = (state) => state;

export const getTaxonomyGradesByClassId = (classId) => createSelector(stateValue, (stateItem) => {
  return stateItem.taxonomyGrades ? stateItem.taxonomyGrades[classId] : null;
});

function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

const taxonomyGradesReducer = createReducer({},
  on(setTaxonomyGrades, (state, { key, data }) => setStateData(state, key, data)));

export function taxonomyGradesStateReducer(state, action: Action) {
  return taxonomyGradesReducer(state, action);
}

// ca domain
const taxonomyCADomainReducer = createReducer({},
  on(setTaxonomyCADomain, (state, { key, data }) => setStateData(state, key, data)));

export function taxonomyCADomainStateReducer(state, action: Action) {
  return taxonomyCADomainReducer(state, action);
}

export const getTaxonomyCADomain = (fwSubjectCourseId) => createSelector(stateValue, (stateItem) => {
  return stateItem.taxonomyCADomain ? stateItem.taxonomyCADomain[fwSubjectCourseId] : null
});

// ca topic
const taxonomyCATopicReducer = createReducer({},
  on(setTaxonomyCATopic, (state, { key, data }) => setStateData(state, key, data)));

export function taxonomyCATopicStateReducer(state, action: Action) {
  return taxonomyCATopicReducer(state, action);
}

export const getTaxonomyCATopic = (fwSubjectDomainId) => createSelector(stateValue, (stateItem) => {
  return stateItem.taxonomyCATopic ? stateItem.taxonomyCATopic[fwSubjectDomainId] : null
});

// ca topic
const taxonomyCACompetencyReducer = createReducer({},
  on(setTaxonomyCACompetency, (state, { key, data }) => setStateData(state, key, data)));

export function taxonomyCACompetencyStateReducer(state, action: Action) {
  return taxonomyCACompetencyReducer(state, action);
}

export const getTaxonomyCACompetency = (fwSubjectDomainTopicId) => createSelector(stateValue, (stateItem) => {
  return stateItem.taxonomyCACompetency ? stateItem.taxonomyCACompetency[fwSubjectDomainTopicId] : null
});
