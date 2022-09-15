export interface StandardPreferenceModel {
  accessibility_settings?: AccessibilitySettingModel;
  language_preference: Array<string>;
  standard_preference: Array<string>;
  learner_data_visibilty_pref?: VisibilityPreferenceModel;
  class_sort_preference?: string;
  class_report_default_landing_route?: string;
}

export interface AccessibilitySettingModel {
  is_high_contrast_enabled: boolean;
  screen_zoom_value: number;
}

export interface ClassificationsModel {
  id: string;
  title: string;
  code: string;
  is_default: boolean;
}

export interface ClassificationTypeModel {
  subjects: Array<SubjectsModel>;
}

export interface SubjectsModel {
  id: string;
  title: string;
  description?: string;
  code: string;
  standard_framework_id?: string;
  standardFrameworkId?: string;
  value?: string;
  frameworks?: Array<FrameworksModel>;
  thumbnailUrl?: string;
}

export interface FrameworksModel {
  standard_framework_id?: string;
  standardFrameworkId?: string;
  taxonomy_subject_id: string;
  taxonomy_subject_title: string;
  title: string;
}

export interface ClassificationsModel {
  title: string;
  subjects: Array<SubjectsModel>;
}
export interface StandardFrameworkModel {
  standardFrameworkId: string;
}

export interface DataVisibilityModel {
  language_preference: Array<string>;
  class_sort_preference: string;
  learner_data_visibilty_pref: VisibilityPreferenceModel;
  class_report_default_landing_route: string;
}

export interface VisibilityPreferenceModel {
  show_timespent: boolean;
  show_score: boolean;
  show_proficiency: boolean;
}
