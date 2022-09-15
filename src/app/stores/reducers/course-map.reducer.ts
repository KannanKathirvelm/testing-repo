import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setLessonCollection, setUnit, setUnitLesson } from '@stores/actions/course-map.action';

const stateValue = (state) => state;

export const getUnitByCourseId = (courseId) => createSelector(stateValue, (stateItem) => {
  return stateItem.unit ? stateItem.unit[courseId] : null;
});

export const getLessonByUnitId = (unitId) => createSelector(stateValue, (stateItem) => {
  return stateItem.unitLesson ? stateItem.unitLesson[unitId] : null;
});

export const getCollectionByLessonId = (lessonId) => createSelector(stateValue, (stateItem) => {
  return stateItem.collection ? stateItem.collection[lessonId] : null;
});

const unitReducer = createReducer({},
  on(setUnit, (state, { key, data }) => setStateData(state, key, data)));

const unitLessonReducer = createReducer({},
  on(setUnitLesson, (state, { key, data }) => setStateData(state, key, data)));

const collectionReducer = createReducer({},
  on(setLessonCollection, (state, { key, data }) => setStateData(state, key, data)));

function setStateData(state, key, data) {
  return {
    ...state,
    [key]: data
  };
}

export function unitStateReducer(state, action: Action) {
  return unitReducer(state, action);
}

export function unitLessonStateReducer(state, action: Action) {
  return unitLessonReducer(state, action);
}

export function collectionStateReducer(state, action: Action) {
  return collectionReducer(state, action);
}
