import { Injectable } from '@angular/core';
import { ScopeAndSequenceDomainModel } from '@models/class-activity/scope-and-sequence/scope-and-sequence';
import { CrossWalkSubjectModel } from '@models/competency/competency';
import { TaxonomyModel } from '@models/taxonomy/taxonomy';
import { Store } from '@ngrx/store';
import { TaxonomyProvider } from '@providers/apis/taxonomy/taxonomy';
import { setClassifications } from '@stores/actions/lookup.action';
import { setTaxonomyCACompetency, setTaxonomyCADomain, setTaxonomyCATopic, setTaxonomyGrades } from '@stores/actions/taxonomy.action';
import { getClassifications } from '@stores/reducers/lookup.reducer';
import { getTaxonomyCACompetency, getTaxonomyCADomain, getTaxonomyCATopic, getTaxonomyGradesByClassId } from '@stores/reducers/taxonomy.reducer';
import { cloneObject } from '@utils/global';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaxonomyService {

  // -------------------------------------------------------------------------
  // Properties

  private crossWalkSubject: BehaviorSubject<CrossWalkSubjectModel>;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private store: Store, private taxonomyProvider: TaxonomyProvider) {
    this.crossWalkSubject = new BehaviorSubject<CrossWalkSubjectModel>(null);
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchTaxonomyDomains
   * This method is used to fetch taxonomy domains
   */
  public fetchTaxonomyDomains(domainsParams): Promise<Array<ScopeAndSequenceDomainModel>> {
    return new Promise((resolve, reject) => {
      const key = `${domainsParams.fwCode}_${domainsParams.subject}_${domainsParams.gradeId}`;
      const taxonomyCADomainSubscription = this.store.select(getTaxonomyCADomain(key)).subscribe((taxonomyCADomain) => {
        if (!taxonomyCADomain) {
          this.taxonomyProvider.fetchDomains(domainsParams.fwCode, domainsParams.subject, domainsParams.gradeId).then((result: Array<ScopeAndSequenceDomainModel>) => {
            this.store.dispatch(setTaxonomyCADomain({ key, data: result }));
            resolve(cloneObject(result));
          });
        } else {
          resolve(cloneObject(taxonomyCADomain));
        }
      }, (error) => {
        reject(error);
      });
      taxonomyCADomainSubscription.unsubscribe();
    });
  }

  public fetchTopicsByDomain(topicParams) {
    return new Promise((resolve, reject) => {
      const key = `${topicParams.fwCode}_${topicParams.subject}_${topicParams.domainId}`;
      const taxonomyCATopicSubscription = this.store.select(getTaxonomyCATopic(key)).subscribe((taxonomyCATopic) => {
        if (!taxonomyCATopic) {
          this.taxonomyProvider.fetchTopicsByDomain(topicParams.fwCode, topicParams.subject, topicParams.domainId).then((result) => {
            this.store.dispatch(setTaxonomyCATopic({ key, data: result }));
            resolve(cloneObject(result));
          });
        } else {
          resolve(cloneObject(taxonomyCATopic));
        }
      });
      taxonomyCATopicSubscription.unsubscribe();
    });
  }

  public fetchCompetenciesByDomainTopic(competencyParams) {
    return new Promise((resolve, reject) => {
      const key = `${competencyParams.fwCode}_${competencyParams.subject}_${competencyParams.domainId}_${competencyParams.topicId}`;
      const taxonomyCACompetencySubscription = this.store.select(getTaxonomyCACompetency(key)).subscribe((taxonomyCACompetency) => {
        if (!taxonomyCACompetency) {
          this.taxonomyProvider.fetchCompetenciesByDomainTopic(competencyParams.fwCode, competencyParams.subject, competencyParams.domainId, competencyParams.topicId).then((result) => {
            this.store.dispatch(setTaxonomyCACompetency({ key, data: result }));
            resolve(cloneObject(result));
          });
        } else {
          resolve(cloneObject(taxonomyCACompetency));
        }
      });
      taxonomyCACompetencySubscription.unsubscribe();
    });
  }

  /**
   * @function fetchGradesBySubject
   * This method is used to fetch grades by using subject
   */
  public fetchGradesBySubject(filters) {
    return new Promise((resolve, reject) => {
      const key = `${filters.fw_code}_${filters.subject}`;
      const taxonomyStoreSubscription = this.store.select(getTaxonomyGradesByClassId(key)).subscribe((taxonomyGrades) => {
        if (!taxonomyGrades) {
          this.taxonomyProvider.fetchGradesBySubject(filters).then((result) => {
            this.store.dispatch(setTaxonomyGrades({ key, data: result }));
            resolve(cloneObject(result));
          });
        } else {
          resolve(cloneObject(taxonomyGrades));
        }
      }, (error) => {
        reject(error);
      });
      taxonomyStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchMicroCompetency
   * Method to fetch micro competency
   */
  public fetchMicroCompetency(frameworkId, subjectId, courseId, domainId) {
    return this.taxonomyProvider.fetchCodes(frameworkId, subjectId, courseId, domainId);
  }

  /**
   * @function fetchDomainGradeBoundaryBySubjectId
   * Method to fetch domain grades
   */
  public fetchDomainGradeBoundaryBySubjectId(id) {
    return this.taxonomyProvider.fetchDomainGradeBoundaryBySubjectId(id);
  }

  /**
   * @function fetchSubjects
   * Method to fetch subjects
   */
  public fetchSubjects(categoryId) {
    return this.taxonomyProvider.fetchSubjects(categoryId);
  }

  /**
   * @function fetchSubjectById
   * This method is used to fetch taxonomy subject by id
   */
  public async fetchSubjectById(code) {
    return this.taxonomyProvider.fetchSubjectById(code);
  }

  /**
   * @function fetchCategories
   * This method is used to fetch categories
   */
  public fetchCategories() {
    return new Promise((resolve, reject) => {
      this.getClassifications().then((classifications: Array<TaxonomyModel>) => {
        if (!classifications) {
          this.taxonomyProvider.fetchCategories().then((result) => {
            this.store.dispatch(setClassifications({ data: result }));
            resolve(cloneObject(result));
          }, reject);
        } else {
          resolve(cloneObject(classifications));
        }
      });
    });
  }

  /**
   * @function getClassifications
   * This method used to get the classifications
   */
  public getClassifications() {
    return new Promise((resolve, reject) => {
      const classificationsStoreSubscription = this.store.select(getClassifications())
        .subscribe((classifications) => {
          resolve(cloneObject(classifications));
        }, (error) => {
          reject(error);
        });
      classificationsStoreSubscription.unsubscribe();
    });
  }

  /**
   * @function fetchTaxonomyCourses
   * This method is used to fetch taxonomy courses
   */
  public fetchTaxonomyCourses(courseParams) {
    return this.taxonomyProvider.fetchCourses(courseParams.fw_code, courseParams.subject);
  }

  /**
   * @function fetchCrossWalkFWC
   * This method is used to fetch Cross walk FWC.
   */
  public fetchCrossWalkFWC(frameworkId, subjectCode) {
    return new Promise((resolve, reject) => {
      const key = `${frameworkId}_${subjectCode}`;
      const crossWalk = this.crossWalkData;
      if (crossWalk && crossWalk[`${key}`]) {
        resolve(crossWalk[`${key}`]);
      } else {
        this.taxonomyProvider.fetchCrossWalkFWC(frameworkId, subjectCode).then((crossWalkData) => {
          const crossWalkModel = {
            [key]: crossWalkData,
            ...this.crossWalkData
          };
          this.crossWalkSubject.next(crossWalkModel);
          resolve(crossWalkData);
        }, reject);
      }
    });
  }

  get crossWalkData() {
    return this.crossWalkSubject ? cloneObject(this.crossWalkSubject.value) : null;
  }
}
