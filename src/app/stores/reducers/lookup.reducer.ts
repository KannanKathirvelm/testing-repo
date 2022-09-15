import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setClassifications, setCountries, setLanguages, setTenantSettings } from '@stores/actions/lookup.action';

const stateValue = (state) => state;

export const getTenantSettings = () => createSelector(stateValue, (stateItem) => {
  return stateItem?.tenantSettings?.data || null;
});

export const getClassifications = () => createSelector(stateValue, (stateItem) => {
  return stateItem?.classifications?.data || null;
});

export const getCountries = () => createSelector(stateValue, (stateItem) => {
  return stateItem?.countries?.data || null;
});

export const getLanguages = () => createSelector(stateValue, (stateItem) => {
  return stateItem?.languages?.data || null;
});

const tenantSettingsReducer = createReducer({},
  on(setTenantSettings, (state, { data }) => setStateData(state, data)));

const classificationsReducer = createReducer({},
  on(setClassifications, (state, { data }) => setStateData(state, data)));

const countriesReducer = createReducer({},
  on(setCountries, (state, { data }) => setStateData(state, data)));

const languagesReducer = createReducer({},
  on(setLanguages, (state, { data }) => setStateData(state, data)));

function setStateData(state, data) {
  return {
    ...state,
    data
  };
}

export function tenantSettingsStateReducer(state, action: Action) {
  return tenantSettingsReducer(state, action);
}

export function classificationsStateReducer(state, action: Action) {
  return classificationsReducer(state, action);
}

export function countriesStateReducer(state, action: Action) {
  return countriesReducer(state, action);
}

export function languagesStateReducer(state, action: Action) {
  return languagesReducer(state, action);
}
