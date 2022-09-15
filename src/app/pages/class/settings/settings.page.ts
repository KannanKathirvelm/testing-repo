import { Component, OnDestroy } from '@angular/core';
import { EVENTS } from '@app/constants/events-constants';
import { SessionModel } from '@app/models/auth/session';
import { ParseService } from '@app/providers/service/parse/parse.service';
import { SCORES, SETTINGS } from '@constants/helper-constants';
import { routerPathStartWithSlash as routerPath } from '@constants/router-constants';
import { AlertController, NavController } from '@ionic/angular';
import { ClassMembersModel, ClassModel, SecondaryClassesModel } from '@models/class/class';
import { LanguageModel } from '@models/profile/profile';
import { TaxonomyGrades, TaxonomyModel } from '@models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { CourseService } from '@providers/service/course/course.service';
import { LookupService } from '@providers/service/lookup/lookup.service';
import { ScopeAndSequenceService } from '@providers/service/scope-and-sequence/scope-and-sequence.service';
import { SessionService } from '@providers/service/session/session.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { UtilsService } from '@providers/service/utils.service';
import { cloneObject, getCategoryCodeFromSubjectId } from '@utils/global';
import { AnonymousSubscription } from 'rxjs/Subscription';
@Component({
  selector: 'settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})

export class SettingsPage implements OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  public defaultLanguage: string;
  public classDetails: ClassModel;
  public classMembersDetails: ClassMembersModel;
  public categories: Array<TaxonomyModel>;
  public activeCategory: TaxonomyModel;
  public selectedSubject: string;
  public taxonomyGrades: Array<TaxonomyGrades>;
  public scopeAndSequencesList: Array<TaxonomyGrades>;
  public sourceGrades: Array<TaxonomyGrades>;
  public destinationGrades: Array<TaxonomyGrades>;
  public languages: Array<LanguageModel>;
  public showStudentList: boolean;
  public isShowRoster: boolean;
  public isEnableRosterSync: boolean;
  public isMasteryApplicable: boolean;
  public competencyScore: number;
  public classGrades: Array<TaxonomyGrades>;
  public hideRoute0: boolean;
  public showCorrectAnswer: boolean;
  public isClassEdit: boolean;
  public showStudentInfo: string;
  public languageSelectHeader: { header: string };
  public classSelectHeader: { header: string };
  public gradeSelectHeader: { header: string };
  public isAllowMultiGrade: boolean;
  public secondaryClassList: Array<SecondaryClassesModel>;
  public selectedSecondaryClassIds: Array<string>;
  public scopeAndSequencesGradeIds: Array<number>;
  public selectedGradeId: number;
  public classHasFwcode: boolean;
  public classSubject: string;
  public isPremiumClass: boolean;
  public className: string;
  public isShowDeleteClass: boolean;
  public isShowArchiveClass: boolean;
  public isShowCommunity: boolean;
  public classSettingShowMultiGrade: boolean;
  public showPresentDiagnostic: boolean;
  public allowStudentsToAsk: boolean;
  public tenantSettings: TenantSettingsModel;
  public classDetailsSubscription: AnonymousSubscription;
  public userSession: SessionModel;
  public showEvidence: boolean;
  public autoAssign: boolean;
  public isShowMultiGrade: boolean;
  public hasShowGradeLevel: boolean;
  public isCaBaselineWorkflow: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private taxonomyService: TaxonomyService,
    public alertController: AlertController,
    private translate: TranslateService,
    private utilsService: UtilsService,
    private lookupService: LookupService,
    private courseService: CourseService,
    private scopeAndSequenceService: ScopeAndSequenceService,
    private navCtrl: NavController,
    private sessionService: SessionService,
    private parseService: ParseService
  ) {
    this.showStudentList = false;
    this.isShowRoster = false;
    this.isClassEdit = false;
    this.languageSelectHeader = {
      header: this.translate.instant('LANGUAGES')
    };
    this.classSelectHeader = {
      header: this.translate.instant('CLASSES')
    }
    this.gradeSelectHeader = {
      header: this.translate.instant('GRADES')
    }
  }

  // -------------------------------------------------------------------------
  // life cycle methods

  public ionViewWillEnter() {
    this.classDetailsSubscription = this.classService.fetchClassDetails
      .subscribe((classDetails) => {
        this.classDetails = classDetails;
      });
  }

  public ngOnDestroy() {
    this.classDetailsSubscription.unsubscribe();
  }

  public ionViewDidEnter() {
    this.initialize();
    this.fetchCategories();
    this.loadTaxonomyGrades();
    this.fetchLanguages();
    this.fetchClassMembers();
  }

  public initialize() {
    this.loadCompletionScore();
    this.userSession = this.sessionService.userSession;
    this.className = this.classDetails.title;
    this.isPremiumClass = this.classDetails.isPremiumClass;
    this.classSubject = this.classDetails.preference && this.classDetails.preference.subject ? this.classDetails.preference.subject : null;
    this.isEnableRosterSync = this.getRoasterSyncSetting();
    this.isMasteryApplicable = this.getMasteryApplicableSetting();
    this.showCorrectAnswer = this.getShowCorrectAnswerSetting();
    this.showEvidence = this.getShowEvidenceSetting();
    this.autoAssign = this.getAutoAssignSetting();
    this.classHasFwcode = this.classDetails.preference && this.classDetails.preference.framework;
    this.selectedGradeId = this.classDetails.setting && this.classDetails.setting['pref.scope.and.sequences'] ?.length ?
      this.classDetails.setting['pref.scope.and.sequences'][0].grade_master_id : 0;
  }

  public compareById(o1, o2) {
    return o1.id === o2.id
  }

  // -------------------------------------------------------------------------
  // Click Events

  /**
   * @function clickCopy
   * This method used to copy the content to clipboard
   */
  public clickCopy() {
    this.utilsService.copyToClipBoard(this.classDetails.code);
  }

  // -------------------------------------------------------------------------
  // Change Events

  /**
   * @function changeLanguage
   * This Method is used to change the language of app
   */
  public changeLanguage(event) {
    const languageCode = event.detail.value;
    this.classService.updateLanguage(this.classDetails.id, languageCode);
    this.parseService.trackEvent(EVENTS.CLICK_CS_LANGUAGE_INSTRUCTION);
  }

  // -------------------------------------------------------------------------
  // toggle Events

  /**
   * @function toggleMasteryCA
   * This Method is used to enable mastery for CA
   */
  public toggleMasteryCA(event) {
    const checkedValue = event.detail.checked;
    const setting = this.classDetails.setting;
    setting['mastery.applicable'] = checkedValue.toString();
    this.classService.updateClass(this.classDetails, setting);
    this.parseService.trackEvent(EVENTS.CLICK_CS_ENABLE_COMPEDENCY_MASTERY);
  }

  /**
   * @function toggleShowCorrectAnswer
   * This Method is used to toggle show correct answer
   */
  public toggleShowCorrectAnswer(event) {
    const toggleValue = event.detail.checked;
    const currentClass = this.classDetails;
    const setting = currentClass.setting;
    setting['show.correct.answer'] = toggleValue;
    this.classService.updateClass(this.classDetails, setting);
    this.parseService.trackEvent(EVENTS.CLICK_CS_SHOW_CORRECT_ANSWER);

  }

  /**
   * @function toggleStudentAskQuestion
   * This Method is used to toggle student ask question
   */
  public async toggleStudentAskQuestion(event) {
    const isEnabled = event.detail.checked;
    this.allowStudentsToAsk = isEnabled;
    const classId = this.classDetails.id;
    const settingsParams = {
      enableCommunityCollaboration: isEnabled ? SETTINGS.ON : SETTINGS.OFF
    }
    await this.classService.updateClassCommunitySettings(classId, settingsParams);
    const setting = this.classDetails.setting;
    const settingParams = { ...setting };
    settingParams.enableCommunityCollaboration = isEnabled;
    this.classService.updateClass(this.classDetails, settingParams);
  }

  /**
   * @function toggleForceCalculateILPSetting
   * This Method is used to toggle force calculatingILP setting
   */
  public toggleForceCalculateILPSetting(event) {
    const forceCalculateILP = this.classDetails.forceCalculateIlp;
    this.classDetails.forceCalculateIlp = !forceCalculateILP;
    this.applyClassSettings();
    this.parseService.trackEvent(EVENTS.CLICK_CS_PRESENR_DIAGNOSTIC);

  }

  /**
   * @function toggleRosterSync
   * This Method is used to toggle Roaster sync
   */
  public toggleRosterSync(event) {
    this.isEnableRosterSync = event.detail.checked;
    const toggleValue = event.detail.checked;
    const settingsParams = {
      'roster.sync.enabled': toggleValue
    };
    if (toggleValue) {
      this.onConfirmRoasterSync(settingsParams);
    } else {
      this.updateClassRoasterSyncSettings(settingsParams);
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchLanguages
   * This Method is used to fetch languages
   */
  public fetchLanguages() {
    this.lookupService.fetchLanguages().then((language) => {
      this.languages = language;
    });
  }

  /**
   * @function fetchClassMembers
   * This method is used to fetch class memebers
   */
  public async fetchClassMembers(isForceReload?) {
    const classMembersPromise = this.classService.fetchClassMembersByClassId(this.classDetails.id, isForceReload);
    const tenantSettingPromise = this.lookupService.fetchTenantSettings();
    Promise.all([classMembersPromise, tenantSettingPromise]).then((result) => {
      this.classMembersDetails = result[0] as ClassMembersModel;
      this.loadTenantSettings(result[1]);
    });
  }

  /**
   * @function loadTenantSettings
   * This method is used to fetch tenant settings
   */
  public loadTenantSettings(tenantSettings) {
    this.tenantSettings = tenantSettings;
    this.showStudentInfo = this.tenantSettings.classSettingShowStudentInfo;
    this.classSettingShowMultiGrade = this.tenantSettings.classSettingShowMultiGrade;
    this.showPresentDiagnostic = this.tenantSettings.showPresentDiagnostic;
    this.isShowCommunity = tenantSettings.enableCommunityCollaboration === SETTINGS.ON;
    this.isShowRoster = tenantSettings['showClassRoasterSyncControl'] === SETTINGS.ON;
    this.hideRoute0 = tenantSettings['hideRoute0Setting'] === SETTINGS.ON;
    this.isCaBaselineWorkflow = tenantSettings['caBaselineWorkflow'];
    this.loadClassSettings();
    this.loadCompletionScore();
  }

  public loadClassSettings() {
    const tenantSettings = this.tenantSettings;
    const userDetails = this.sessionService.userSession;
    const currentClass = this.classDetails;
    const setting = currentClass.setting;
    const subject = this.classSubject;
    this.allowStudentsToAsk = setting && setting.enableCommunityCollaboration === SETTINGS.ON;
    const userTenantSetting = userDetails.tenant ? userDetails.tenant.settings : null;
    const isAllowMultiGrade = userTenantSetting && userTenantSetting.allow_multi_grade_class === SETTINGS.ON;
    if (tenantSettings && isAllowMultiGrade && subject) {
      this.loadSecondaryClassList();
    }
  }

  public loadCompletionScore() {
    const tenantSettings = this.tenantSettings;
    this.competencyScore = SCORES.VERY_GOOD;
    if (tenantSettings && tenantSettings['competencyCompletionMinScore']) {
      const competencyScore = tenantSettings['competencyCompletionMinScore'];
      const competencyDefaultScore = tenantSettings['competencyCompletionDefaultMinScore'];
      if (this.classDetails.preference) {
        const classPreference = this.classDetails.preference;
        const frameworkCode = classPreference.framework;
        const subjectCode = classPreference.subject;
        const minScore = competencyScore[`${frameworkCode}.${subjectCode}`]
          ? competencyScore[`${frameworkCode}.${subjectCode}`]
          : competencyDefaultScore
            ? competencyDefaultScore
            : SCORES.VERY_GOOD;
        this.competencyScore = minScore;
      } else {
        this.competencyScore = competencyDefaultScore;
      }
    }
  }

  /**
   * @function loadSecondaryClassList
   * This method is used to load secondary
   */
  public loadSecondaryClassList() {
    this.classService.fetchMultipleClassList(this.classDetails.id).then((secondaryClasses) => {
      this.secondaryClassList = secondaryClasses;
      const teacherSettings = this.classDetails.setting;
      const settingsSecondaryClass = teacherSettings ? teacherSettings['secondary.classes'] : null;
      const teacherSelectedGradeList = settingsSecondaryClass ? settingsSecondaryClass.list : null;
      if (teacherSelectedGradeList) {
        this.selectedSecondaryClassIds = teacherSelectedGradeList;
      }
      this.isShowMultiGrade = !!(this.isPremiumClass && this.classSettingShowMultiGrade && this.secondaryClassList && this.secondaryClassList.length);
    });
  }

  /**
   * @function onStudentStatus
   * This method is used to set student active status
   */
  public async onStudentStatus(event) {
    if (event.status) {
      await this.classService.activateClassMember(this.classDetails.id, [event.studentId]);
    } else {
      await this.classService.deactivateClassMember(this.classDetails.id, [event.studentId]);
    }
    this.fetchClassMembers(true);
  }

  /**
   * @function onDeletedStudent
   * This method is used to update the members of the class after a member is deleted
   */
  public onDeletedStudent(event) {
    this.fetchClassMembers(true);
  }

  /**
   * @function onAddNewStudent
   * This method is used to update the members of the class after a member is added
   */
  public onAddNewStudent(event) {
    this.fetchClassMembers(true);
  }

  /**
   * @function onMathLevelChange
   * This method is used to update math level (source)
   */
  public onMathLevelChange(event) {
    const users = [{
      user_id: event.studentId,
      grade_lower_bound: event.lowerBound,
      grade_level: event.gradeLevel
    }];
    this.classService.reRouteClass(this.classDetails.id, users).then(() => {
      this.fetchClassMembers();
      this.calculateUserSkyline(event.studentId);
    });
  }

  /**
   * @function destinationChange
   * This method is used to update destination level (destination)
   */
  public onDestionationChange(event) {
    const users = [{
      user_id: event.studentId,
      grade_upper_bound: event.upperBound
    }];
    this.classService.reRouteClass(this.classDetails.id, users).then(() => {
      this.fetchClassMembers();
    });
  }

  /**
   * @function calculateUserSkyline
   * This method is used to set student skyline
   */
  public calculateUserSkyline(studentId) {
    this.courseService.calculateUserSkyline(this.classDetails.id, [studentId]);
  }

  /**
   * @function fetchCategories
   * This method is used to fetch categories
   */
  private fetchCategories() {
    if (this.classDetails) {
      this.taxonomyService.fetchCategories().then((categories: Array<TaxonomyModel>) => {
        this.categories = categories;
        if (this.classSubject) {
          const classificationCode = getCategoryCodeFromSubjectId(this.classSubject);
          const category = categories.find((categoryObj) => {
            return categoryObj.code === classificationCode;
          });
          this.activeCategory = category;
          this.fetchSubjects(this.activeCategory.id);
        }
      });
    }
  }

  /**
   * @function fetchSubjects
   * Method to fetch the subjects
   */
  public fetchSubjects(categoryId) {
    this.taxonomyService.fetchSubjects(categoryId).then((subjects) => {
      const subjectCode = this.classSubject;
      const activeSubject = subjects.find((subject) => {
        return subject.code === subjectCode;
      });
      const defaultSubject = activeSubject ? activeSubject : subjects[0];
      this.selectedSubject = defaultSubject['title'];
    });
  }

  /**
   * @function loadTaxonomyGrades
   * Method to taxonomy grades
   */
  private loadTaxonomyGrades() {
    const fwCode = this.classDetails ?.preference ?.framework;
    if (this.classSubject && fwCode) {
      const filters = {
        subject: this.classSubject,
        fw_code: fwCode
      };
      return this.taxonomyService.fetchGradesBySubject(filters)
        .then((taxonomyGrades: Array<TaxonomyGrades>) => {
          this.taxonomyGrades = taxonomyGrades.sort((grade1, grade2) =>
            grade1.sequenceId - grade2.sequenceId);
          this.filterTaxonomyGrades();
          this.scopeAndSequences();
        });
    }
  }

  /**
   * @function scopeAndSequences
   * This Method is used to get scope and sequence for the class
   */
  public scopeAndSequences() {
    const subjectCode = this.classDetails.preference.subject;
    const fwCode = this.classDetails.preference.framework;
    const taxonomyParams = {
      subjectCode,
      fw_code: fwCode
    };
    this.scopeAndSequenceService.fetchScopeAndSequence(taxonomyParams).then((grades) => {
      if (grades ?.length) {
        this.scopeAndSequencesGradeIds = grades[0].gradesCovered;
        this.classScopeAndSequencesList();
      }
    });
  }

  /**
   * @function classScopeAndSequencesList
   * This Method is used to filter the class grades
   */
  public classScopeAndSequencesList() {
    this.scopeAndSequencesList = this.taxonomyGrades.filter((taxonomyGrade) => {
      return this.scopeAndSequencesGradeIds.includes(taxonomyGrade.id);
    });
  }

  /**
   * @function filterTaxonomyGrades
   * Method to filter taxonomy grades
   */
  public filterTaxonomyGrades() {
    const gradeLowerBound = this.classDetails.gradeLowerBound;
    const gradeCurrent = this.classDetails.gradeCurrent;
    const tempTaxonomyGrades = cloneObject(this.taxonomyGrades);
    this.sourceGrades = [];
    this.destinationGrades = [];
    this.classGrades = [];
    if (tempTaxonomyGrades) {
      const sourceStartSelectionItem = tempTaxonomyGrades.find((item) => item.id === gradeLowerBound);
      const rangeSelectionIndex = tempTaxonomyGrades.indexOf(sourceStartSelectionItem);
      const rangeEndSelectionItem = tempTaxonomyGrades.find((item) => item.id === gradeCurrent);
      const rangeEndSelectionIndex = tempTaxonomyGrades.indexOf(rangeEndSelectionItem);
      const tempSourceItems = tempTaxonomyGrades.slice(rangeSelectionIndex, rangeEndSelectionIndex + 1);
      this.sourceGrades = tempSourceItems;
      const hasShowGradeLevel = tempTaxonomyGrades.find((item) => item.showGradeLevel);
      this.hasShowGradeLevel = !!hasShowGradeLevel;
      if (hasShowGradeLevel) {
        let mathGradeLevels = [];
        tempSourceItems.forEach((item) => {
          mathGradeLevels = mathGradeLevels.concat(item.levels);
        });
        this.sourceGrades = mathGradeLevels;
      }
      const destinationStartSelectionItem = tempTaxonomyGrades.find((item) => item.id === gradeCurrent);
      if (destinationStartSelectionItem) {
        const rangeDestinationSelectionIndex = tempTaxonomyGrades.indexOf(destinationStartSelectionItem);
        this.destinationGrades = tempTaxonomyGrades.slice(rangeDestinationSelectionIndex);
      }
      const classGradeSelectionItem = tempTaxonomyGrades.find((item) => item.id === gradeLowerBound);
      if (classGradeSelectionItem) {
        const rangeGradeSelectionIndex = tempTaxonomyGrades.indexOf(classGradeSelectionItem);
        this.classGrades = tempTaxonomyGrades.splice(rangeGradeSelectionIndex);
      }
    }
  }

  /**
   * @function closeDeleteClassPopup
   * This Method is used to close popup
   */
  public closeDeleteClassPopup() {
    this.isShowArchiveClass = false;
    this.isShowDeleteClass = false;
  }

  /**
   * @function deleteClassRoom
   * This Method is used to delete a class room
   */
  public async deleteClassRoom() {
    this.parseService.trackEvent(EVENTS.DELETE_CLASS_ROOM);
    this.isShowDeleteClass = true;
  }

  /**
   * @function onConfirmRoasterSync
   * This Method is used to show alert when toggle roaster sync
   */
  public async onConfirmRoasterSync(params) {
    const alert = await this.alertController.create({
      cssClass: 'alert-roaster-sync-container',
      header: this.translate.instant('WARNING'),
      message: this.translate.instant('ROASTER_SYNC_CONFIRM_MSG'),
      buttons: [
        {
          text: this.translate.instant('NO'),
          role: 'cancel',
          cssClass: 'cancel-button',
          handler: () => {
            this.isEnableRosterSync = false;
          }
        }, {
          text: this.translate.instant('YES'),
          cssClass: 'yes-button',
          handler: () => {
            this.updateClassRoasterSyncSettings(params);
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * @function onConfirmDeleteClassRoom
   * Method is to delete the classroom
   */
  public onConfirmDeleteClassRoom() {
    this.classService.deleteClassRoom(this.classDetails.id);
    const context = {
      classId: this.classDetails.id
    }
    this.parseService.trackEvent(EVENTS.DELETE_CLASS_ROOM, context);
    this.navCtrl.navigateRoot(routerPath('teacherHome'), { queryParams: { isReload: true } });
  }

  /**
   * @function archiveClassRoom
   * This Method is used to achive a class room
   */
  public async archiveClassRoom() {
    this.isShowArchiveClass = true;
    const context = {
      classId: this.classDetails.id
    }
    this.parseService.trackEvent(EVENTS.ARCHIVE_CLASS_ROOM, context);
  }

  /**
   * @function onConfirmArchiveClassRoom
   * Method is to archive the classroom
   */
  public onConfirmArchiveClassRoom() {
    this.classService.archiveClassRoom(this.classDetails.id);
    this.navCtrl.navigateRoot(routerPath('teacherHome'), { queryParams: { isReload: true } });
  }

  /**
   * @function onToggleStudentList
   * Method is used to toggle student list
   */
  public onToggleStudentList() {
    this.showStudentList = !this.showStudentList;
    if (!this.showStudentList) {
      this.fetchClassMembers();
    }
  }

  /**
   * @function onDeleteCollaborator
   * Method is used to delete collabarator
   */
  public onDeleteCollaborator(collaboratorId) {
    const collaboratorIds = this.classMembersDetails.collaborators
      .filter((item) => item.id !== collaboratorId)
      .map((item) => item.id);
    this.onUpdateCollaborator(collaboratorIds);
  }

  /**
   * @function onUpdateCollaborator
   * Method is used to update collabarator
   */
  public onUpdateCollaborator(collaboratorIds) {
    collaboratorIds = collaboratorIds && collaboratorIds.length ? collaboratorIds : null;
    this.classService.updateCollaborators(this.classDetails.id, collaboratorIds).then(() => {
      this.fetchClassMembers(true);
    });
  }

  /**
   * @function onApplySettings
   * Method is used to apply the class setting changes
   */
  public onApplySettings(selectedCollaboratorId) {
    this.classService.updateClassOwner(this.classDetails.id, selectedCollaboratorId).then(() => {
      this.fetchClassMembers(true);
    });
  }

  /**
   * @function updateClassRoasterSyncSettings
   * Method is used to update class roaster sync settings
   */
  public updateClassRoasterSyncSettings(settingsParams) {
    this.classService.routerSyncSettings(this.classDetails.id, settingsParams);
  }

  /**
   * @function getRoasterSyncSetting
   * Method is used to get roaster sync setting
   */
  public getRoasterSyncSetting() {
    const classSettings = this.classDetails.setting;
    return classSettings && classSettings['roster.sync.enabled'] !== undefined
      ? classSettings['roster.sync.enabled']
      : true;
  }

  /**
   * @function getMasteryApplicableSetting
   * Method is used to get mastery applicable setting
   */
  public getMasteryApplicableSetting() {
    let isMasteryApplicable = false;
    const setting = this.classDetails.setting;
    if (setting) {
      isMasteryApplicable =
        setting['mastery.applicable'] === true ||
        setting['mastery.applicable'] === 'true';
    }
    return isMasteryApplicable;
  }

  /**
   * @function getShowCorrectAnswerSetting
   * Method is used to get show correct answer setting
   */
  public getShowCorrectAnswerSetting() {
    const setting = this.classDetails.setting;
    let showCorrectAnswer = true;
    if (setting) {
      showCorrectAnswer = setting['show.correct.answer'];
    }
    return showCorrectAnswer === undefined ? true : showCorrectAnswer;
  }

  /**
   * @function applyClassSettings
   * Method is used to apply class settings
   */
  public applyClassSettings() {
    if (this.classDetails.courseId && this.classSubject) {
      const settings = {
        grade_lower_bound: this.classDetails.gradeLowerBound,
        grade_upper_bound: this.classDetails.gradeUpperBound,
        grade_current: this.classDetails.gradeCurrent,
        route0: this.classDetails.route0Applicable,
        force_calculate_ilp: this.classDetails.forceCalculateIlp,
        preference: this.classDetails.preference
      };
      this.updateClassSettings(settings);
    }
  }

  /**
   * @function updateClassSettings
   * Method is used to update class settings
   */
  public updateClassSettings(settings) {
    const classId = this.classDetails.id;
    this.classService.updateClassSettings(classId, settings, this.isPremiumClass).then(() => {
      this.fetchClassMembers();
    });
  }


  /**
   * @function updateClassName
   * Method is used to update class name
   */
  public async updateClassName() {
    const context = this.getEventContext();
    this.isClassEdit = !this.isClassEdit;
    const setting = this.classDetails.setting;
    await this.classService.updateClass(this.classDetails, setting);
    this.parseService.trackEvent(EVENTS.CLASS_SETTINGS_EDIT_CLASS_NAME_STUDENT, context);
    this.classService.setClassNameUpdatedStatus(true);
  }

  /**
   * @function selectSecondaryClasses
   * Method is used to select secondary classes
   */
  public selectSecondaryClasses(event) {
    const context = this.getEventContext();
    this.parseService.trackEvent(EVENTS.CLASS_SETTINGS_MULTI_GRADE, context);
    const selectedMultiGradedClass = event.detail.value;
    const setting = this.classDetails.setting;
    setting['secondary.classes'] = {
      list: selectedMultiGradedClass,
      confirmation: true
    };
    this.classService.updateClass(this.classDetails, setting);
  }

  /**
   * @function selectGradeList
   * Method is used to select secondary classes
   */
  public selectGradeList(event) {
    const selectedGrade = event.detail.value;
    const setting = this.classDetails.setting;
    setting['pref.scope.and.sequences'] = [{
      grade_master_id: selectedGrade,
      id: 1
    }];
    this.classService.updateClass(this.classDetails, setting);
    this.parseService.trackEvent(EVENTS.CLICK_CS_MULTI_GRADE_SAVE);
  }

  /*
   * @function toggleShowEvidence
   * This Method is used to toggle show evidence
   */
  public toggleShowEvidence(event) {
    const toggleValue = event.detail.checked;
    const currentClass = this.classDetails;
    const setting = currentClass.setting;
    setting['show.evidence'] = toggleValue;
    this.classService.updateClass(this.classDetails, setting);
    this.parseService.trackEvent(EVENTS.CLICK_CS_UPLOAD_EVIDENCE);
  }

  /*
   * @function toggleAutoAssign
   * This Method is used to toggle auto assign class activity
   */
  public toggleAutoAssign(event) {
    const toggleValue = event.detail.checked;
    const currentClass = this.classDetails;
    const setting = currentClass.setting || {};
    setting['ca.auto.assign.content'] = toggleValue;
    this.classService.updateClass(this.classDetails, setting);
  }

  /*
   * @function getShowEvidenceSetting
   * Method is used to get show evidence setting
   */
  public getShowEvidenceSetting() {
    const setting = this.classDetails.setting;
    let showEvidence = true;
    if (setting) {
        showEvidence = setting['show.evidence'];
    }
    return showEvidence === undefined ? true : showEvidence;
  }

    /*
   * @function getAutoAssignSetting
   * Method is used to get auto assign setting
   */
    public getAutoAssignSetting() {
      const setting = this.classDetails.setting;
      return setting && setting['ca.auto.assign.content'] || false;
    }

  /**
   * @function getEventContext
   * This method is used to get the context for settings event
   */
  public getEventContext() {
    return {
      classId: this.classDetails.id,
      className: this.classDetails.title,
      courseId: this.classDetails.courseId
    };
  }
}
