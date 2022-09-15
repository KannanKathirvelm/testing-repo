import { Injectable } from '@angular/core';
import { AppConfigModel } from '@app/models/config/config';
import { DOCUMENT_KEYS } from '@constants/database-constants';
import { SETTINGS } from '@constants/helper-constants';
import { SESSION } from '@constants/session-constants';
import { environment } from '@environment/environment';
import { LocationModel } from '@models/analytics/analytics';
import { AudiencesAndEducationalModel, CountryModel, LanguageModel } from '@models/lookup/lookup';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { HttpService } from '@providers/apis/http';
import { DatabaseService } from '@providers/service/database.service';
import { SessionService } from '@providers/service/session/session.service';
import { UtilsService } from '@providers/service/utils.service';

@Injectable({
  providedIn: 'root'
})
export class LookupProvider {

  // -------------------------------------------------------------------------
  // Properties
  private namespaceV1 = 'api/nucleus/v1';
  private locationNamespace = 'http://ip-api.com/json';
  private lookupNamespace = 'api/nucleus/v1/lookups';
  private parseNamespace: string;


  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private httpService: HttpService,
    private databaseService: DatabaseService,
    private utilsService: UtilsService,
    private sessionService: SessionService,
  ) {
    this.parseNamespace = environment.PARSE_API_PATH;
  }


  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  public fetchTenantSettings(): Promise<TenantSettingsModel> {
    return new Promise((resolve, reject) => {
      if (this.utilsService.isNetworkOnline()) {
        const endpoint = `${this.namespaceV1}/lookups/tenant-settings`;
        this.httpService.get<TenantSettingsModel>(endpoint).then((res) => {
          const tenantSettings = res.data ? res.data.tenant_settings : null;
          if (!tenantSettings) {
            return {} as TenantSettingsModel;
          }
          const normalizedTenantSettings = this.normalizeTenantsettings(tenantSettings);
          this.databaseService.upsertDocument(DOCUMENT_KEYS.TENANT_SETTINGS, normalizedTenantSettings);
          resolve(normalizedTenantSettings);
        }, reject);
      } else {
        this.databaseService.getDocument(DOCUMENT_KEYS.TENANT_SETTINGS).then((result) => {
          resolve(result.value);
        }, reject);
      }
    });
  }

  /**
   * @function fetchAudiences
   * This method is used to fetch audiences
   */
  public fetchAudiences(): Promise<Array<AudiencesAndEducationalModel>> {
    const endpoint = `${this.namespaceV1}/lookups/audience`;
    return this.httpService.get<Array<AudiencesAndEducationalModel>>(endpoint).then((res) => {
      return this.normalizeAudiences(res.data.audience);
    });
  }

  /**
   * @function fetchLanguages
   * This method is used to fetch languages
   */
  public fetchLanguages(): Promise<Array<LanguageModel>> {
    const endpoint = `${this.namespaceV1}/lookups/languages`;
    return this.httpService.get<Array<LanguageModel>>(endpoint).then((res) => {
      return this.normalizeLanguages(res.data.languages);
    });
  }

  /**
   * @function fetchEducationalUse
   * This method is used to fetch educational use
   */
  public fetchEducationalUse(): Promise<Array<AudiencesAndEducationalModel>> {
    const endpoint = `${this.namespaceV1}/lookups/educational-use`;
    return this.httpService.get<Array<AudiencesAndEducationalModel>>(endpoint).then((res) => {
      return this.normalizeAudiences(res.data.educational_use);
    });
  }

  /**
   * @function normalizeAudiences
   * This method is used to normalize the audiences
   */
  private normalizeAudiences(payload): Array<AudiencesAndEducationalModel> {
    return payload.map((audience) => {
      return {
        id: audience.id,
        label: audience.label,
        sequenceId: audience.sequence_id
      };
    });
  }

  /**
   * @function normalizeLanguages
   * This method is used to normalize the language
   */
  private normalizeLanguages(payload): Array<LanguageModel> {
    return payload.map((language) => {
      return {
        description: language.description,
        displayName: language.display_name,
        id: language.id,
        name: language.name,
        label: language.display_name,
        sequenceId: language.sequence_id
      };
    });
  }

  /**
   * @function normalizeTenantsettings
   * This method is used to normalize the tenant settings
   */
  private normalizeTenantsettings(payload): TenantSettingsModel {
    const payloadTxSubClassifierPrefs = payload.tx_sub_classifier_prefs;
    const txSubClassifierPrefs = {
      defaultubClassificationId: payloadTxSubClassifierPrefs ?
        payloadTxSubClassifierPrefs.default_sub_classification_id : null,
      isGlobalVisible: payloadTxSubClassifierPrefs ?
        payloadTxSubClassifierPrefs.is_global_visible : null,
      ids: payloadTxSubClassifierPrefs ? payloadTxSubClassifierPrefs.ids : null
    };
    const subPrefs = payload.tx_sub_prefs;
    const txSubPrefsKeys = subPrefs ? Object.keys(subPrefs) : null;
    const txSubPrefsKey = txSubPrefsKeys && txSubPrefsKeys.length ? txSubPrefsKeys[0] : null;
    const txSubPrefs = txSubPrefsKey ? {
      subject: txSubPrefsKey,
      defaultGutSubjectCode: subPrefs[`${txSubPrefsKey}`].default_gut_subject_code,
      isGlobalVisible: subPrefs[`${txSubPrefsKey}`].is_global_visible
    } : null;
    const classSettings = payload.navigator_class_setting;
    const classSettingsKeys = classSettings ? Object.keys(classSettings) : null;
    const classSettingsKey = classSettingsKeys && classSettingsKeys.length ? classSettingsKeys[0] : null;
    const courseVisibility = payload.allow_to_change_class_course_content_visibility;
    const navigatorClassSetting = classSettingsKey ? {
      subjectCode: classSettingsKey,
      classOrigin: classSettings[`${classSettingsKey}`].class_origin,
      classVersion: classSettings[`${classSettingsKey}`].class_version,
      courseId: classSettings[`${classSettingsKey}`].course_id,
      diagnosticApplicable: classSettings[`${classSettingsKey}`].diagnostic_applicable,
      framework: classSettings[`${classSettingsKey}`].framework,
      route0Applicable: classSettings[`${classSettingsKey}`].route0_applicable,
      studentMathLevel: classSettings[`${classSettingsKey}`].student_math_level
    } : null;
    const tenantSettings: TenantSettingsModel = {
      fluencyLevel: payload.fluency_level,
      translationSetting: payload.translation_setting,
      allowMultiGradeClass: payload.allow_multi_grade_class,
      classSettingShowStudentInfo: payload.class_settings_show_student_info,
      classSettingShowMultiGrade: payload.class_setting_show_multi_grade || false,
      showPresentDiagnostic: payload.show_present_diagnostic_setting_in_class || false,
      competencyCompletionDefaultMinScore: payload.competency_completion_default_min_score ? Number(payload.competency_completion_default_min_score) : null,
      competencyCompletionMinScore: payload.competency_completion_min_score,
      competencyCompletionThresholdForAssessment: payload.competency_completion_threshold_for_assessment,
      enableClsVideoConfSetup: payload.enable_cls_video_conf_setup,
      groupHierarchy: payload.group_hierarchy,
      filterNonPremiumCourse: payload.filter_non_premium_course,
      navigatorClassSetting,
      txSubClassifierPrefs,
      txSubPrefs,
      twFwPref: payload.tx_fw_prefs,
      uiElementVisibilitySettings: payload.ui_element_visibility_settings ? this.normalizeVisibilitySettings(payload.ui_element_visibility_settings) : null,
      preferredFacetSubjectCodes: payload.preferred_facet_subject_codes,
      useLearnerDataVisibiltyPref: payload.use_learner_data_visibilty_pref,
      defaultSkylineGradeDiffForDiagnostic: payload.default_skyline_grade_diff_for_diagnostic_flow || null,
      defaultSkylineGradeDiff: payload.default_skyline_grade_diff,
      navigatorRouteMapViewApplicable: payload.navigator_route_map_view_applicable,
      showClassRoasterSyncControl: payload.show_class_roster_sync_control,
      enableCommunityCollaboration: payload.enable_community_collaboration,
      hideRoute0Setting: payload.hide_route0_setting,
      preferredMeetingTool: payload.preferred_meeting_tool,
      isCaAutoAssignToStudent: payload.ca_auto_assign_to_student === SETTINGS.ON,
      domainDiagnosticEnabled: payload.domain_diagnostic_enabled === 'true',
      showIncompleteClassrooms: payload.show_incomplete_classrooms === 'on',
      courseContentVisibility: courseVisibility !== undefined ? courseVisibility === 'on' : true,
      caBaselineWorkflow: payload.enable_ca_baseline_and_regular_workflow
    };
    return tenantSettings;
  }

  /**
   * @function normalizeVisibilitySettings
   * This method is used to normalize the UI visibility settings
   */
  private normalizeVisibilitySettings(payload) {
    return {
      enableCreateClass: payload.enable_create_class,
      classCreateShowSubjectCards: payload.class_create_show_subject_cards,
      showQuestionEvidence: payload.show_question_evidence,
      showReactionOnly: payload.show_reaction_only,
      lessonLabelCourseMap: payload.lesson_label_course_map,
      questionEvidenceVisibility: payload.question_evidence_visibility ? {
        default: payload.question_evidence_visibility.default,
        fillInTheBlankQuestion: payload.question_evidence_visibility.fill_in_the_blank_question,
        hotTextReorderQuestion: payload.question_evidence_visibility.hot_text_reorder_question,
        multipleAnswerQuestion: payload.question_evidence_visibility.multiple_answer_question,
        multipleChoiceQuestion: payload.question_evidence_visibility.multiple_choice_question,
        openEndedQuestion: payload.question_evidence_visibility.open_ended_question,
        trueFalseQuestion: payload.question_evidence_visibility.true_false_question
      } : null,
      poChartYaxisLabel: payload.po_chart_y_axis_label,
      displayDomainLabel: payload.display_domain_label,
      atcViewDefaultProgressSelection: payload.atc_view_default_progress_selection,
      hideCourseMapViewContentLabelSeq: payload.hide_course_map_view_content_label_seq
    };
  }

  /**
   * @function fetchLocationInfo
   * This method is used to fetch location Info
   */
  public fetchLocationInfo() {
    if (this.utilsService.isNetworkOnline()) {
      const endpoint = `${this.locationNamespace}`;
      return this.httpService.get<LocationModel>(endpoint, {}).then((res) => {
        const normalizeLocationInfo = this.normalizeLocationInfo(res && res.data || {});
        this.sessionService.setValueToStorage(SESSION.USER_LOCATION_INFO, normalizeLocationInfo);
        return normalizeLocationInfo;
      });
    } else {
      return this.sessionService.getValueFromStorage(SESSION.USER_LOCATION_INFO)
        .then((locationRes) => {
          return locationRes || {};
        });
    }
  }

  /**
   * @function normalizeLocationInfo
   * This method is used to normalize the location info
   */
  private normalizeLocationInfo(payload): LocationModel {
    return {
      city: payload.city,
      country: payload.country,
      countryCode: payload.countryCode,
      isp: payload.isp,
      lat: payload.lat,
      lon: payload.lon,
      org: payload.org,
      query: payload.query,
      region: payload.region,
      regionName: payload.regionName,
      timezone: payload.timezone,
      pin: payload.zip
    };
  }

  /**
   * @function fetchCountries
   * This Method is used to get the countries list
   */
  public fetchCountries(): Promise<Array<CountryModel>> {
    const endpoint = `${this.lookupNamespace}/countries`;
    return this.httpService.get<CountryModel>(endpoint).then((res) => {
      return res.data.countries;
    });
  }

  /*
   * @function fetchAppConfig
   * This method is used to fetch app config
   */
  public fetchAppConfig() {
    const endpoint = `${this.parseNamespace}/config`;
    const headers = this.httpService.getAppIdHeaders();
    if (this.utilsService.isNetworkOnline()) {
      return this.httpService.get<AppConfigModel>(endpoint, {}, headers).then((res) => {
        const normalizeAppConfig = this.normalizeAppConfig(res.data);
        this.sessionService.setValueToStorage(SESSION.APP_CONFIG, normalizeAppConfig);
        return normalizeAppConfig;
      });
    } else {
      return this.sessionService.getValueFromStorage(SESSION.APP_CONFIG)
        .then((appConfig) => {
          return appConfig || {};
        });
    }
  }

  /*
   * @function normalizeAppConfig
   * This method is used to normalize the app config
   */
  private normalizeAppConfig(payload) {
    if (payload) {
      const appConfig: any = [];
      payload.forEach((config) => {
        const item = {
          value: config.value
        };
        appConfig[config.key] = item;
      });
      return appConfig;
    }
    return;
  }
}
