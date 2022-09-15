import { CountryModel, LanguageModel } from '@models/lookup/lookup';
import { TaxonomyModel } from '@models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';

import { createAction, props } from '@ngrx/store';
export const setTenantSettings = createAction(
  '[TenantSettings] SetTenantSettings',
  props<{ data: TenantSettingsModel; }>()
);
export const setClassifications = createAction(
  '[Classifications] SetClassifications',
  props<{ data: Array<TaxonomyModel>; }>()
);
export const setCountries = createAction(
  '[Countries] SetCountries',
  props<{ data: Array<CountryModel>; }>()
);

export const setLanguages = createAction(
  '[Languages] SetLanguages',
  props<{ data: Array<LanguageModel>; }>()
);
