import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DEFAULT_CLASS_IMAGES, SUBJECTS_SUBJECT_CODE } from '@constants/helper-constants';
import { routerPathIdReplace } from '@constants/router-constants';
import { NavController } from '@ionic/angular';
import { FrameworksModel, SubjectsModel } from '@models/preferences/preferences';
import { TaxonomyGrades, TaxonomyModel, TaxonomySubjectModel } from '@models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@models/tenant/tenant-settings';
import { TranslateService } from '@ngx-translate/core';
import { ClassService } from '@providers/service/class/class.service';
import { ModalService } from '@providers/service/modal/modal.service';
import { NetworkService } from '@providers/service/network.service';
import { PreferencesService } from '@providers/service/preferences/preferences.service';
import { TaxonomyService } from '@providers/service/taxonomy/taxonomy.service';
import { UtilsService } from '@providers/service/utils.service';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'create-classroom',
  templateUrl: './create-classroom.component.html',
  styleUrls: ['./create-classroom.component.scss'],
})
export class CreateClassroomComponent implements OnInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Properties
  public subjects: Array<SubjectsModel>;
  public categories: Array<TaxonomyModel>;
  public selectGradeId: number;
  public inputClassname: string;
  public inputSubjectClassname: string;
  public selectedSubject: SubjectsModel;
  public userSelectedCategory: TaxonomyModel;
  public userSelectedSubject: TaxonomySubjectModel;
  public userSelectedFramework: FrameworksModel;
  public userSelectedGrade: TaxonomyGrades;
  public subjectCode: string;
  public tenantSetting: TenantSettingsModel;
  public categorySubjects: Array<SubjectsModel>;
  public grades: Array<TaxonomyGrades>;
  public filters: { subject: string, fw_code?: string };
  public subjectSelecttHeader: { header: string };
  public createClassroom: boolean;
  public showSubjectView: boolean;
  public showFrameworkView: boolean;
  public showGradeView: boolean;
  public gradeSelected: boolean;
  public showSubjectGradeList: boolean;
  public userSelectedSubjectGrade: boolean;
  public classCreateShowSubjectCards: boolean;
  public isOnline: boolean;
  public networkSubscription: AnonymousSubscription;
  public isClicked: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private taxonomyService: TaxonomyService,
    private preferencesService: PreferencesService,
    private translate: TranslateService,
    private navCtrl: NavController,
    private classService: ClassService,
    private modalService: ModalService,
    private utilsService: UtilsService,
    private networkService: NetworkService,
    private zone: NgZone
  ) {
    this.networkSubscription = this.networkService.onNetworkChange().subscribe(() => {
      this.zone.run(() => {
        this.isOnline = this.utilsService.isNetworkOnline();
      });
    });
    this.initialValue();
    this.subjectSelecttHeader = {
      header: this.translate.instant('SUBJECTS')
    }
  }
  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.classCreateShowSubjectCards = this.tenantSetting ?.uiElementVisibilitySettings ?.classCreateShowSubjectCards === false
      ? this.tenantSetting.uiElementVisibilitySettings.classCreateShowSubjectCards : true;
    this.fetchSubjectList();
  }

  public ngOnDestroy() {
    this.networkSubscription.unsubscribe();
}

  /**
   * @function initialValue
   * This method is used set initial values
   */
  public initialValue() {
    this.createClassroom = false;
    this.showSubjectView = false;
    this.showFrameworkView = false;
    this.showGradeView = false;
    this.showSubjectGradeList = false;
    this.userSelectedSubjectGrade = false;
    this.gradeSelected = false;
  }

  /**
   * @function fetchSubjectList
   * This method is used to fetch subject list to create classroom based on selected subject
   */
  public async fetchSubjectList() {
    if (this.tenantSetting ?.twFwPref && this.tenantSetting ?.txSubClassifierPrefs) {
      const fwPref = this.tenantSetting ?.twFwPref;
      const subClassifierPrefs = this.tenantSetting ?.txSubClassifierPrefs;
      const fwPrefKeys = Object.keys(fwPref);
      const categoryIds = subClassifierPrefs.ids;
      const filter = 'hasgrade';
      const preferencePromises = [];
      categoryIds.forEach(categoryId => {
        if (categoryId) {
          const promiseItem = new Promise((resolve, reject) => {
            this.preferencesService.fetchClassificationType(categoryId, filter).then((items) => {
              resolve(items);
            });
          });
          preferencePromises.push(promiseItem);
        }
      });
      await Promise.all(preferencePromises).then((allResults) => {
        const finalResult = [];
        allResults.forEach(item => {
          item.forEach(element => {
            finalResult.push(element);
          });
        });
        const subjectList = finalResult.filter((item) => {
          return fwPrefKeys.includes(item.id);
        });
        this.subjects = subjectList;
      });
    }
    else {
      this.subjects = SUBJECTS_SUBJECT_CODE;
    }
  }

  /**
   * @function changeSubject
   * This method is used to get values changes by the user
   */
  public changeSubject(event) {
    const selectedSubId = event.detail.value;
    const selectedSubject = this.subjects.find((item) => item.id === selectedSubId);
    if (selectedSubject) {
      this.selectedSubject = selectedSubject;
      const randomNumber = Math.floor(Math.random() * 3);
      Object.assign(this.selectedSubject, {
        thumbnailUrl: DEFAULT_CLASS_IMAGES[`CLASS_DEFAULT_${randomNumber}`]
      });
    }
  }

  /**
   * @function closeModal
   * This method is used to close the whole modal
   */
  public closeModal() {
    this.modalService.dismissModal();
  }

  /**
   * @function closeClassCreation
   * This method is used to close class creation
   */
  public closeClassCreation() {
    this.initialValue();
    this.inputClassname = '';
  }

  /**
   * @function onClickCreateClassroom
   * Method to create a classroom
   */
  public onClickCreateClassroom() {
    this.createClassroom = true;
    this.fetchCategories();
  }

  /**
   * @function fetchCategories
   * This method is used to fetch categories to create class.
   */
  private fetchCategories() {
    this.taxonomyService.fetchCategories().then((categories: Array<TaxonomyModel>) => {
      this.categories = categories;
    });
  }

  /**
   * @function closeSubjectListView
   * This method is used to avoid subject list view
   */
  public closeSubjectListView() {
    this.createClassroom = true;
    this.showSubjectView = false;
  }

  /**
   * @function closeFrameworkListView
   * This method is used to avoid framework list view
   */
  public closeFrameworkListView() {
    this.showSubjectView = true;
    this.showFrameworkView = false;
  }

  /**
   * @function closeGradeListView
   * This method is used to avoid grades list view
   */
  public closeGradeListView() {
    this.showFrameworkView = true;
    this.showGradeView = false;
  }

  /**
   * @function onClickCategory
   * Method is to perform action when user selected any category to create class
   */
  public onClickCategory(category) {
    this.showSubjectView = true;
    this.userSelectedCategory = category;
    const categoryId = category.id;
    const filter = 'hasgrade';
    this.preferencesService.fetchClassificationType(categoryId, filter).then((items) => {
      this.categorySubjects = items.filter((i) => {
        return i.frameworks.length > 0;
      });
    });
  }

  /**
   * @function onClickSubject
   * Method is to perform action when user selected any subject form the list
   */
  public onClickSubject(subject) {
    this.showFrameworkView = true;
    this.userSelectedSubject = subject;
  }

  /**
   * @function onClickFramework
   * Method is to perform action when user selected any framework form the list
   */
  public onClickFramework(framework) {
    this.showGradeView = true;
    this.userSelectedFramework = framework;
    const subject = framework.taxonomySubjectId.split('.');
    this.subjectCode = subject.length === 3 ? subject[1].concat('.', subject[2]) : subject[0];
    const filters = {
      subject: this.subjectCode,
      fw_code: framework.standardFrameworkId
    };
    this.fetchGradesBySubject(filters);
  }

  /**
   * @function fetchGradesBySubject
   * Method is to get grade list by passing subject code and framework id
   */
  public fetchGradesBySubject(filters) {
    this.taxonomyService.fetchGradesBySubject(filters).then((grades: Array<TaxonomyGrades>) => {
      this.grades = grades.sort((a,b) => a.sequenceId - b.sequenceId);
    });
  }

  /**
   * @function onClickGrade
   * Method is to perform action when user selected any grade form the list
   */
  public onClickGrade(grade) {
    this.gradeSelected = true;
    this.userSelectedGrade = grade;
  }

  /**
   * @function onClickCancel
   * Method is to cancel creation of the class
   */
  public onClickCancel() {
    this.gradeSelected = false;
    this.showSubjectGradeList = false;
    this.inputSubjectClassname = '';
    this.selectedSubject = null;
  }

  /**
   * @function onClickConfirm
   * Method is to create a new class
   */
  public onClickConfirm() {
    this.isClicked = true;
    const filters = {
      class_sharing: 'open',
      content_visibility: 'visible_all',
      min_score: 0,
      setting: null,
      title: this.inputClassname || this.inputSubjectClassname
    };
    this.classService.updateNewClass(filters).then((result) => {
      const classId = result.headers.location;
       this.updateClassPreference(classId);
    })
  }

  /**
   * @function updateClassPreference
   * Method is to update class preferences for new class
   */
  public updateClassPreference(classId) {
    const framework = this.userSelectedFramework ?.standardFrameworkId || this.filters ?.fw_code || null;
    const subject = this.subjectCode || this.filters ?.subject || this.selectedSubject && this.selectedSubject.code || null;
    const gradeId = this.userSelectedGrade && this.userSelectedGrade.id || this.selectGradeId;
    if (framework && subject) {
      this.preferencesService.updateClassPreference(classId, framework, subject).then((result) => {
        if (gradeId) {
          const settings = {
            grade_lower_bound: this.grades[0].id,
            grade_current: gradeId,
            force_calculate_ilp: true,
            preference: {subject,framework}
          }
          this.classService.updateRerouteSettings(classId, settings).then(() => {
            this.redirectToClassSetting(classId);
          });
        } else {
          this.redirectToClassSetting(classId);
        }
      });
    } else {
      this.redirectToClassSetting(classId);
    }
  }

  /**
   * @function redirectToClassSetting
   * Method is to redirect to class settings page after class is been created
   */
  public redirectToClassSetting(classId) {
    this.isClicked = false;
    const settingsURL = routerPathIdReplace('settings', classId);
    this.navCtrl.navigateRoot([settingsURL]);
    this.closeModal();
  }

  /**
   * @function onClickSubjectBasedGrade
   * Method is for subject based class creation
   */
  public onClickSubjectBasedGrade(grade) {
    this.userSelectedSubjectGrade = true;
    this.selectGradeId = grade.id;
  }

  /**
   * @function onClickSubjectClass
   * Method is to list grades based on the user selected subject to create class
   */
  public onClickSubjectClass() {
    this.showSubjectGradeList = true;
    const subjectCode = this.selectedSubject.code;
    const tenantfwCode = this.tenantSetting.twFwPref && this.tenantSetting.twFwPref[`${subjectCode}`];
    const filters = {
      subject: subjectCode
    };
    if (tenantfwCode) {
      Object.assign(filters, {
        fw_code: tenantfwCode.fw_ids[0]
      })
    } else {
      Object.assign(filters, {
        fw_code: subjectCode === 'K12.ELA' ? 'ELA' : subjectCode === 'K12.NMS' ? 'NMS' : 'TMA'
      })
    }
    this.filters = filters;
    this.fetchGradesBySubject(filters);
  }
}
